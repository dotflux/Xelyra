import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ConversationsService } from 'src/services/conversations.service';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export interface RecieverInfo {
  id: string;
  username: string;
  pfp: string;
}

export const fetchReciever = async (
  req: Request,
  conversation: string,
  usersService: UsersService,
  conversationsService: ConversationsService,
  groupsService: GroupsService,
  channelsService: ChannelsService,
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

    const dmRows = await conversationsService.findById(conversation);
    if (dmRows.length > 0) {
      const participants: string[] = dmRows[0].participants.map(String);
      if (!participants.includes(user[0].id.toString())) {
        throw new BadRequestException(
          `Not a participant of DM ${conversation}`,
        );
      }

      // find the other user
      const otherId = participants.find((p) => p !== user[0].id.toString())!;
      const otherRows = await usersService.findById(otherId);
      if (otherRows.length === 0) {
        throw new BadRequestException(`User ${otherId} not found`);
      }

      return {
        valid: true,
        message: 'DM receiver fetched.',
        recieverData: {
          id: otherRows[0].id,
          username: otherRows[0].username,
          displayName: otherRows[0].display_name,
          type: 'dm',
          pfp: otherRows[0].pfp,
        },
      };
    }

    const grpRows = await groupsService.findById(conversation);
    if (grpRows.length > 0) {
      const participants: string[] = grpRows[0].participants.map(String);
      if (!participants.includes(user[0].id.toString())) {
        throw new BadRequestException(`Not a member of group ${conversation}`);
      }

      return {
        valid: true,
        message: 'Group info fetched.',
        recieverData: {
          id: grpRows[0].id,
          username: grpRows[0].name,
          type: 'group',
          pfp: grpRows[0].pfp,
        },
      };
    }
    const channelRow = await channelsService.findById(conversation);
    if (channelRow.length > 0) {
      return {
        valid: true,
        message: 'Channel Info fetched.',
        recieverData: {
          id: channelRow[0].id,
          username: channelRow[0].name,
          type: 'channel',
        },
      };
    }

    throw new BadRequestException('No such conversation');
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching reciever info: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
