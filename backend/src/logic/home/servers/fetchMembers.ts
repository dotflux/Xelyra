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

export interface Member {
  username: string;
  id: string;
  displayName: string;
  pfp: string;
  roles: string[];
}

export const fetchMembers = async (
  req: Request,
  serverId: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMembersService: ServerMembersService,
  channelsService: ChannelsService,
  limit: number = 20,
  afterId?: string,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) throw new UnauthorizedException('No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!decoded?.id) throw new UnauthorizedException('Invalid token');
    const user = await usersService.findById(decoded?.id);
    if (user.length === 0)
      throw new UnauthorizedException('No such user in database');
    const server = await serversService.findById(serverId);
    if (server.length === 0) throw new BadRequestException('No such server');
    const serverMember = await serverMembersService.findById(
      serverId,
      user[0].id,
    );
    if (serverMember.length === 0)
      throw new BadRequestException('Not a member');

    const membersRaw = await serverMembersService.fetchBatch(
      serverId,
      limit,
      afterId,
    );
    if (!membersRaw || membersRaw.length === 0) {
      return { valid: true, message: 'No more members', members: [] };
    }

    const userIds = membersRaw.map((m: any) => m.user_id);
    const users = await Promise.all(
      userIds.map((id: string) => usersService.findById(id)),
    );
    const members = membersRaw.map((m: any, idx: number) => {
      const userInfo = users[idx][0] || {};
      return {
        id: m.user_id,
        username: userInfo.username || '',
        display_name: userInfo.display_name || '',
        pfp: userInfo.pfp || '',
        roles: m.roles || [],
      };
    });

    return {
      valid: true,
      message: 'Fetched Members',
      members,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching members.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
