import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { GroupsService } from 'src/services/groups.service';

dotenv.config();

export interface GroupInfo {
  name: string;
  pfp: string;
}

export const fetchGroupInfo = async (
  req: Request,
  group: string,
  usersService: UsersService,
  messagesService: MessagesService,
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

    const groupRow = await groupsService.findById(group);
    if (groupRow.length === 0) {
      throw new BadRequestException('No such conversation');
    }
    const isOwner = groupRow[0].owner.equals(user[0].id);
    if (!isOwner) {
      throw new BadRequestException('You are not the owner');
    }
    if (
      !groupRow[0].participants
        .map((m) => m.toString())
        .includes(user[0].id.toString())
    ) {
      throw new BadRequestException('You are not a participant');
    }

    const groupInfo: GroupInfo = {
      name: groupRow[0].name,
      pfp: groupRow[0].pfp,
    };

    return {
      valid: true,
      message: 'Fetched from Group.',
      groupInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching info from group.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
