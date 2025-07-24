import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { v4 as uuidv4 } from 'uuid';
import { ServersService } from 'src/services/servers.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export const leaveServer = async (
  req: Request,
  serverId: string,
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
    const server = await serversService.findById(serverId);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }
    const serverMember = await serverMembersService.findById(
      serverId,
      user[0].id,
    );
    if (serverMember.length === 0) {
      throw new BadRequestException('Not a member');
    }
    if (server[0].owner.toString() === user[0].id.toString()) {
      throw new BadRequestException('Cant leave server as owner');
    }

    await Promise.all([
      serverMembersService.removeMember(serverId, user[0].id),
      usersService.removeServer(serverId, user[0].id),
    ]);

    return {
      valid: true,
      message: 'Left Server.',
      serverId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in leaving server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
