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
import { PermissionsService } from 'src/services/permissions.service';

dotenv.config();

export const listBans = async (
  req: Request,
  serverId: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMembersService: ServerMembersService,
  channelsService: ChannelsService,
  permissionsService: PermissionsService,
  limit: number = 70,
  afterId?: string,
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
    const canBan = await permissionsService.canDo(
      serverId,
      user[0].id,
      'BAN_USERS',
    );
    const isAdmin = await permissionsService.canDo(
      serverId,
      user[0].id,
      'ADMIN',
    );
    const isOwner = server[0].owner.toString() === user[0].id.toString();
    if (!canBan && !isAdmin && !isOwner) {
      throw new BadRequestException('You do not have permission to do this');
    }

    const bans = await serversService.fetchBansBatch(
      serverId,
      Number(limit),
      afterId as string,
    );

    const userIds = bans.map((m: any) => m.banned_id);
    const users = await Promise.all(
      userIds.map((id: string) => usersService.findById(id)),
    );
    const bansInfo = bans.map((m: any, idx: number) => {
      const userInfo = users[idx][0] || {};
      return {
        id: m.banned_id,
        username: userInfo.username || '',
        display_name: userInfo.display_name || '',
        pfp: userInfo.pfp || '',
      };
    });

    return {
      valid: true,
      message: 'Listed Server Bans.',
      bansInfo,
      hasMore: bans.length === Number(limit),
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in listing bans from server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
