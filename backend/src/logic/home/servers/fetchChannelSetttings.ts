import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { ChannelsService } from 'src/services/channels.service';
import { PermissionsService } from 'src/services/permissions.service';
import { Permission, RolesService } from 'src/services/roles.service';
import { ChannelOverwritesService } from 'src/services/channelOverwrites.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
dotenv.config();

export interface Overwrite {
  targetName: string;
  targetId: string;
  allow: Permission[];
  deny: Permission[];
}

export interface RoleInfo {
  name: string;
  role_id: string;
  color: string;
}

export interface ChannelSettings {
  name: string;
  overwrites: Overwrite[];
  roles: RoleInfo[];
}

export const fetchChannelSettings = async (
  req: Request,
  id: string,
  channel: string,
  usersService: UsersService,
  serversService: ServersService,
  channelsService: ChannelsService,
  rolesService: RolesService,
  permissionsService: PermissionsService,
  channelOverService: ChannelOverwritesService,
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
    const server = await serversService.findById(id);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }

    const channelRow = await channelsService.findById(channel);
    if (channelRow.length === 0) {
      throw new BadRequestException('No such channel');
    }

    const isMember = await serverMemberService.findById(
      server[0].id,
      user[0].id,
    );
    if (isMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }

    const canView = await permissionsService.canView(
      id,
      channel,
      user[0].id,
      channelRow[0].isPrivate,
    );
    const canManage = await permissionsService.canManage(
      id,
      channel,
      user[0].id,
      channelRow[0].isPrivate,
    );

    if (!canView || !canManage) {
      throw new BadRequestException('Cant manage that channel');
    }

    let finalOverwrites: Overwrite[] = [];

    const overwritesRow =
      await channelOverService.findAllChannelOverwrites(channel);
    if (overwritesRow.length > 0) {
      for (const overwrite of overwritesRow) {
        const role = await rolesService.findById(overwrite.target_id);
        if (role.length === 0) {
          continue;
        }
        finalOverwrites.push({
          targetName: role[0].name,
          targetId: role[0].role_id,
          allow: overwrite.allow,
          deny: overwrite.deny,
        });
      }
    }

    const allRoles = await rolesService.findAllServerRoles(server[0].id);

    const settings: ChannelSettings = {
      name: channelRow[0].name,
      overwrites: finalOverwrites,
      roles: allRoles,
    };

    return {
      valid: true,
      message: 'Fetched Channel Settings.',
      settings,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching channel settings.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
