import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ConversationsService } from 'src/services/conversations.service';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export const fetchMessages = async (
  req: Request,
  conversation: string,
  usersService: UsersService,
  messagesService: MessagesService,
  conversationsService: ConversationsService,
  groupsService: GroupsService,
  channelsService: ChannelsService,
  cursor?: string,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    if (!decoded?.id) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await usersService.findById(decoded?.id);
    if (user.length === 0) {
      throw new UnauthorizedException('No such user in database');
    }

    if (!conversation) {
      throw new BadRequestException('Invalid parameters');
    }

    const conversationRow = await conversationsService.findById(conversation);
    const groupRow = await groupsService.findById(conversation);
    const channelRow = await channelsService.findById(conversation);
    if (
      conversationRow.length === 0 &&
      groupRow.length === 0 &&
      channelRow.length === 0
    ) {
      throw new BadRequestException('Invalid conversation.');
    }

    const isDm = conversationRow.length > 0;
    const isGroup = groupRow.length > 0;
    const isChannel = channelRow.length > 0;
    const userId = user[0].id.toString();
    if (
      (isDm &&
        !conversationRow[0].participants
          .map((p) => p.toString())
          .includes(userId)) ||
      (isGroup &&
        !groupRow[0].participants.map((m) => m.toString()).includes(userId))
    ) {
      throw new BadRequestException('Not a member');
    }

    // Get limit from request or use defaults
    const limit =
      req.body && req.body.limit ? parseInt(req.body.limit) : cursor ? 10 : 20;
    const userCursor = req.body.userCursor;
    const commandCursor = req.body.commandCursor;
    let allMessages: any[] = [],
      allCommands: any[] = [];
    if (userCursor || commandCursor) {
      if (userCursor) {
        allMessages = await messagesService.getOlderMessages(
          conversation,
          userCursor,
          limit,
        );
      } else {
        allMessages = [];
      }
      if (commandCursor) {
        allCommands = await messagesService.getOlderCommands(
          conversation,
          commandCursor,
          limit,
        );
      } else {
        allCommands = [];
      }
    } else {
      allMessages = await messagesService.getMessages(conversation, limit);
      allCommands = await messagesService.getCommands(conversation, limit);
    }
    return {
      valid: true,
      message: 'Messages fetched.',
      messages: allMessages,
      commands: allCommands,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching message: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
