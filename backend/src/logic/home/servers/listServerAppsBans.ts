import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from '../../../services/users.service';
import { MessagesService } from '../../../services/messages.service';
import { ServersService } from '../../../services/servers.service';
import { v4 as uuidv4 } from 'uuid';
import { ServerMembersService } from '../../../services/serverMembers.service';
import { ServerAppsService } from '../../../services/serverApps.service';
import { PermissionsService } from '../../../services/permissions.service';
import { ApplicationsService } from '../../../services/applications.service';

dotenv.config();

export interface ServerApp {
  id: string;
  name: string;
  pfp: string;
}

export const listServerAppsBans = async (
  req: Request,
  id: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMemberService: ServerMembersService,
  serverAppsService: ServerAppsService,
  permissionsService: PermissionsService,
  appService: ApplicationsService,
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
    const isAllowed = await permissionsService.canDo(id, user[0].id, 'ADMIN');
    const isOwner = server[0].owner.toString() === user[0].id.toString();
    if (!isAllowed && !isOwner) {
      throw new BadRequestException('You do not have permission to do this');
    }

    const serverApps = await serversService.fetchBansBatch(
      id,
      Number(limit),
      afterId as string,
    );
    const appIds = serverApps.map((m: any) => m.banned_id);
    const apps = await Promise.all(
      appIds.map((appid: string) => appService.findById(appid)),
    );

    const appsInfo: ServerApp[] = serverApps.map((m: any, idx: number) => {
      const appInfo = apps[idx][0] || {};
      return {
        id: appInfo.app_id,
        name: appInfo.name || '',
        pfp: appInfo.pfp || '',
      };
    });

    return {
      valid: true,
      message: 'Fetched Server Apps Bans.',
      apps: appsInfo,
      hasMore: serverApps.length === limit,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching server apps bans: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
