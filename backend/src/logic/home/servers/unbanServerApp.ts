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
import { ServerAppsService } from 'src/services/serverApps.service';
import { ApplicationsService } from 'src/services/applications.service';

dotenv.config();

export const unbanServerApp = async (
  req: Request,
  serverId: string,
  kickee: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMembersService: ServerMembersService,
  channelsService: ChannelsService,
  permissionsService: PermissionsService,
  serverAppsService: ServerAppsService,
  appService: ApplicationsService,
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

    if (user[0].id.toString() === kickee) {
      throw new BadRequestException('You cannot kick yourself');
    }

    const canKick = await permissionsService.canDo(
      serverId,
      user[0].id,
      'BAN_USERS',
    );
    const isAdmin = await permissionsService.canDo(
      serverId,
      user[0].id,
      'ADMIN',
    );
    const kickerIsOwner = server[0].owner.toString() === user[0].id.toString();
    if (!canKick && !isAdmin && !kickerIsOwner) {
      throw new BadRequestException('You do not have permission to do this');
    }

    const kickeeApp = await serverAppsService.findById(serverId, kickee);
    if (kickeeApp.length > 0) {
      throw new BadRequestException('App is not banned');
    }
    const kickeeUser = await appService.findById(kickee);
    if (kickeeUser.length === 0) {
      throw new BadRequestException('No such app in database');
    }
    const isBanned = await serversService.findBan(serverId, kickee);
    if (isBanned.length === 0) {
      throw new BadRequestException('App is not banned');
    }

    await serversService.removeBan(serverId, kickee);

    return {
      valid: true,
      message: 'Unbanned App From Server.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in unbanning app from server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
