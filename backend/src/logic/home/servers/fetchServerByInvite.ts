import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ServersService } from 'src/services/servers.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export interface InviteInfo {
  server_name: string;
  server_pfp: string;
  server_member: boolean;
  server_id: string;
}

export const fetchServerByInvite = async (
  req: Request,
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

    const invite = await serversService.findInviteLookup(inviteId);
    if (invite.length === 0) {
      throw new BadRequestException('No such invite');
    }
    const server = await serversService.findById(invite[0].server_id);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }
    const serverMember = await serverMembersService.findById(
      server[0].id,
      user[0].id,
    );
    const inviteInfo: InviteInfo = {
      server_name: server[0].name,
      server_pfp: server[0].pfp,
      server_member: serverMember.length > 0,
      server_id: server[0].id,
    };

    return {
      valid: true,
      message: 'Found Invite.',
      inviteInfo,
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
