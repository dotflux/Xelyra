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

export const addToServer = async (
  req: Request,
  serverId: string,
  inviteId: string,
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
    if (serverMember.length > 0) {
      throw new BadRequestException('Already in the server');
    }
    const inviteLookup = await serversService.findInviteLookup(inviteId);
    if (inviteLookup.length === 0) {
      throw new BadRequestException('No such invite');
    }
    if (inviteLookup[0].server_id.toString() !== serverId.toString()) {
      throw new BadRequestException('Invalid invite');
    }
    const isValidInvite = await serversService.findInviteById(
      serverId,
      inviteId,
      inviteLookup[0].created_by,
    );
    if (isValidInvite.length === 0) {
      throw new BadRequestException('No such invite');
    }
    const isBanned = await serversService.findBan(serverId, user[0].id);
    if (isBanned.length > 0) {
      throw new BadRequestException('You are banned from this server');
    }

    await Promise.all([
      serverMembersService.createServerMember(serverId, user[0].id, []),
      usersService.appendServer(serverId, user[0].id),
    ]);

    return {
      valid: true,
      message: 'Added To Server.',
      serverId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in adding to server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
