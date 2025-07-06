import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { v4 as uuidv4 } from 'uuid';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';
import { ServersService } from 'src/services/servers.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export const createServer = async (
  req: Request,
  name: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMembersService: ServerMembersService,
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

    const finalName: string =
      !name || name.length === 0
        ? uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '',
            style: 'capital',
          })
        : name;

    const newId = uuidv4();
    const category = uuidv4();
    const channel = uuidv4();

    await Promise.all([
      serversService.createServer(newId, finalName, user[0].id, 'server'),
      serverMembersService.createServerMember(newId, user[0].id, []),
      usersService.appendServer(newId, user[0].id),
      channelsService.createCategory(newId, category, 'Text channels'),
      channelsService.createChannel(
        newId,
        channel,
        'general',
        'text',
        category,
      ),
    ]);

    return {
      valid: true,
      message: 'Created Server.',
      newId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
