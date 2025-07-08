import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ConversationsService } from 'src/services/conversations.service';
import { v4 as uuidv4 } from 'uuid';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';
import { types } from 'cassandra-driver';

dotenv.config();

export const sendMessage = async (
  req: Request,
  message: string,
  conversation: string,
  usersService: UsersService,
  messagesService: MessagesService,
  conversationsService: ConversationsService,
  messagesGateway: MessagesGateway,
  groupsService: GroupsService,
  channelsService: ChannelsService,
  replyTo?: string,
  files?: any[],
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

    if (message.length === 2000) {
      throw new BadRequestException('Message exceeds limit of 2000 characters');
    }

    const repliedMessage = replyTo
      ? await messagesService.findByTimeId(replyTo)
      : [];
    console.log(repliedMessage);

    const messageId = uuidv4();

    const saved = await messagesService.createMessage(
      messageId,
      message,
      user[0].id,
      conversation,
      false,
      false,
      repliedMessage.length > 0 ? repliedMessage[0].created_at : '',
      files || undefined,
    );

    if (isDm) {
      const otherId = conversationRow[0].participants.find(
        (p: string) => p != user[0].id.toString(),
      );
      await conversationsService.createUnreadCounter(conversation, otherId);
      await conversationsService.setLastMessageTimestamp(
        conversation,
        new Date(saved.created_timestamp),
      );
    }
    if (isGroup) {
      for (const participant of groupRow[0].participants) {
        if (participant.toString() != user[0].id.toString()) {
          await conversationsService.createUnreadCounter(
            conversation,
            participant.toString(),
          );
        }
      }
      await groupsService.setLastMessageTimestamp(
        conversation,
        new Date(saved.created_timestamp),
      );
    }

    messagesGateway.sendToConversation(conversation, {
      conversation: conversation.toString(),
      message: message,
      user: user[0].id.toString(),
      created_at: saved.created_at,
      created_timestamp: saved.created_timestamp,
      id: saved.id.toString(),
      reply_to: saved.reply_to,
      files: saved.files || [],
    });

    return {
      valid: true,
      message: 'Message sent.',
      messageId: saved.created_at,
      files: saved.files || [],
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in sending message: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
