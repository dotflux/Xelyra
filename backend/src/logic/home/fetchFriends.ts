import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ConversationsService } from 'src/services/conversations.service';

dotenv.config();

export interface FriendInfo {
  username: string;
  id: string;
  conversation: string | null;
  pfp: string;
  displayName: string;
}

export const fetchFriends = async (
  req: Request,
  usersService: UsersService,
  conversationsService: ConversationsService,
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

    const friendInfo: FriendInfo[] = [];

    for (const friend of user[0].friends || []) {
      const friendUser = await usersService.findById(friend);
      if (friendUser.length === 0) {
        throw new BadRequestException('No such user in database');
      }
      const dmId = [user[0].id, friendUser[0].id].sort().join('_');
      const conversation = await conversationsService.findDmId(dmId);
      const conversationId =
        conversation.length > 0 ? conversation[0].id : null;
      friendInfo.push({
        username: friendUser[0].username,
        id: friendUser[0].id,
        conversation: conversationId,
        pfp: friendUser[0].pfp,
        displayName: friendUser[0].display_name,
      });
    }

    return {
      valid: true,
      message: 'Friends fetched.',
      friendData: friendInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching friends: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
