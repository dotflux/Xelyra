import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { GroupsService } from 'src/services/groups.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';

dotenv.config();

export const groupAdd = async (
  req: Request,
  group: string,
  participants: string[],
  usersService: UsersService,
  messagesService: MessagesService,
  groupsService: GroupsService,
  messagesGateway: MessagesGateway,
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

    if (!participants || participants.length < 1) {
      throw new BadRequestException('Pick atleast 1 friend');
    }

    let validParticipants: string[] = [];

    for (const participant of participants) {
      const exists = await usersService.findById(participant);
      if (exists.length === 0) {
        throw new BadRequestException('Invalid participant');
      }
      validParticipants.push(participant);
    }

    const totalLength =
      validParticipants.length + groupRow[0].participants.length;

    if (totalLength > 10) {
      throw new BadRequestException('Max members limit exceeded.');
    }
    if (validParticipants.length < 1) {
      throw new BadRequestException('Pick atleast 1 friend');
    }

    for (const participant of validParticipants) {
      if (
        groupRow[0].participants.map((m) => m.toString()).includes(participant)
      ) {
        throw new BadRequestException('User already a participant');
      }
      await Promise.all([
        usersService.appendGroup(group, participant),
        groupsService.addUser(group, participant),
      ]);
    }

    messagesGateway.emitMemberChange(group);

    return {
      valid: true,
      message: 'Added to Group.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in adding to group.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
