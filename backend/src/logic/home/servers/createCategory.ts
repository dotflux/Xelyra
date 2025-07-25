import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from '../../../services/users.service';
import { MessagesService } from '../../../services/messages.service';
import { ServersService } from '../../../services/servers.service';
import { ChannelsService } from '../../../services/channels.service';
import { v4 as uuidv4 } from 'uuid';
import { ServerMembersService } from '../../../services/serverMembers.service';

dotenv.config();

export const createCategory = async (
  req: Request,
  id: string,
  name: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  channelsService: ChannelsService,
  serverMemberService: ServerMembersService,
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

    if (!name) {
      throw new BadRequestException('Missing params');
    }

    const server = await serversService.findById(id);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }

    const isMember = await serverMemberService.findById(
      server[0].id,
      user[0].id,
    );
    if (isMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }

    if (name.length > 20) {
      throw new BadRequestException('Max allowed characters 20');
    }

    const newId = uuidv4();
    await channelsService.createCategory(server[0].id, newId, name);

    return {
      valid: true,
      message: 'Created Category.',
      newId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating category.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
