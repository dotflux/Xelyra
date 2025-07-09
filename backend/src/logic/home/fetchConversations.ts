import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ConversationsService } from 'src/services/conversations.service';
import { GroupsService } from 'src/services/groups.service';

dotenv.config();

export interface ConvInfo {
  reciever: string;
  id: string;
  type: 'dm' | 'group';
  unreadCount?: number;
  last_message_timestamp?: Date;
}

export const fetchConversations = async (
  req: Request,
  usersService: UsersService,
  conversationsService: ConversationsService,
  groupsService: GroupsService,
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
    // 1) DMs in parallel
    const dmInfos = await Promise.all(
      (user[0].conversations || []).map(async (convId) => {
        const [conv] = await conversationsService.findById(convId);
        if (!conv) {
          throw new BadRequestException(`DM ${convId} not found`);
        }
        const otherId = conv.participants.find(
          (p: string) => p != user[0].id.toString(),
        );
        const [otherUser] = await usersService.findById(otherId);
        if (!otherUser) {
          throw new BadRequestException(`User ${otherId} not found`);
        }
        const unreadCounter = await conversationsService.findUnreadCounter(
          convId,
          user[0].id.toString(),
        );
        const unreadCount = unreadCounter.length;
        return {
          id: convId,
          reciever: otherUser.username,
          displayName: otherUser.display_name,
          recieverPfp: otherUser.pfp,
          type: 'dm' as const,
          unreadCount,
          last_message_timestamp: conv.last_message_timestamp,
        };
      }),
    );

    // 2) Groups in parallel
    const grpInfos = await Promise.all(
      (user[0].groups || []).map(async (grpId) => {
        const [grp] = await groupsService.findById(grpId);
        if (!grp) {
          throw new BadRequestException(`Group ${grpId} not found`);
        }
        const unreadCounter = await conversationsService.findUnreadCounter(
          grpId,
          user[0].id.toString(),
        );
        const unreadCount = unreadCounter.length;
        return {
          id: grpId,
          reciever: grp.name,
          recieverPfp: grp.pfp,
          type: 'group' as const,
          unreadCount,
          last_message_timestamp: grp.last_message_timestamp,
        };
      }),
    );

    const convData: ConvInfo[] = [...dmInfos, ...grpInfos];

    return {
      valid: true,
      message: 'Conversations fetched.',
      convData,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching conversations: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
