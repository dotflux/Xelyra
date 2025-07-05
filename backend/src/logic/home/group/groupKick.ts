import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { GroupsService } from 'src/services/groups.service';

dotenv.config();

export const groupKick = async (
  req: Request,
  group: string,
  participant: string,
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
    if (
      !groupRow[0].participants.map((m) => m.toString()).includes(participant)
    ) {
      throw new BadRequestException('That member is not in the group');
    }

    await Promise.all([
      usersService.removeGroup(group, participant),
      groupsService.kickUser(group, participant),
    ]);

    return {
      valid: true,
      message: 'Kicked from Group.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in kicking from group.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
