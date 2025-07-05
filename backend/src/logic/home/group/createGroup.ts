import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { v4 as uuidv4 } from 'uuid';
import { GroupsService } from 'src/services/groups.service';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';

dotenv.config();

export const createGroup = async (
  req: Request,
  name: string,
  participants: string[],
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
    if (!participants || participants.length < 2) {
      throw new BadRequestException('Pick atleast 2 friends');
    }

    let validParticipants: string[] = [user[0].id.toString()];

    for (const participant of participants) {
      const exists = await usersService.findById(participant);
      if (exists.length === 0) {
        continue;
      }
      validParticipants.push(participant);
    }

    if (validParticipants.length > 9) {
      throw new BadRequestException('Max members limit exceeded.');
    }
    if (validParticipants.length < 3) {
      throw new BadRequestException('Pick atleast 2 friends');
    }
    const finalName: string =
      !name || name.length === 0
        ? uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '',
            style: 'capital',
          })
        : name;

    const newId = uuidv4();

    await groupsService.createGroup(
      newId,
      finalName,
      validParticipants,
      user[0].id,
      'group',
    );

    for (const participant of validParticipants) {
      await usersService.appendGroup(newId, participant);
    }

    return {
      valid: true,
      message: 'Created Group.',
      newId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating group.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
