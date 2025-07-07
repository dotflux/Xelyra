import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ConversationsService } from 'src/services/conversations.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import * as fs from 'fs';
import { resolve } from 'path';

dotenv.config();

export const deleteMessage = async (
  req: Request,
  message: string,
  conversation: string,
  usersService: UsersService,
  messagesService: MessagesService,
  conversationsService: ConversationsService,
  messagesGateway: MessagesGateway,
  groupsService: GroupsService,
  channelsService: ChannelsService,
  serverMembersService: ServerMembersService,
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
      throw new BadRequestException('Invalid conversation');
    }
    if (channelRow.length > 1) {
      const member = await serverMembersService.findById(
        channelRow[0].server_id,
        user[0]._id,
      );
      if (member.length === 0) {
        throw new BadRequestException('Not a member');
      }
    }

    const messageRow = await messagesService.findById(message);
    if (messageRow.length === 0) {
      throw new BadRequestException('No such message.');
    }
    if (messageRow[0].user.toString() !== user[0].id.toString()) {
      throw new BadRequestException('Cant delete that message.');
    }

    // Delete files from disk if present
    console.log('Files to delete:', messageRow[0].files);
    if (Array.isArray(messageRow[0].files)) {
      for (const file of messageRow[0].files) {
        if (file && file.filename) {
          const filePath = resolve(process.cwd(), 'uploads', file.filename);
          console.log(
            'Attempting to delete file:',
            filePath,
            fs.existsSync(filePath),
          );
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error('Failed to delete file:', filePath, err);
          }
        }
      }
    }

    await messagesService.deleteMsg(conversation, messageRow[0].created_at);

    messagesGateway.emitMessageDelete(conversation, message);

    return {
      valid: true,
      message: 'Message deleted.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in deleting message: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
