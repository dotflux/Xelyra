import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { RolesService } from 'src/services/roles.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ChannelsService } from 'src/services/channels.service';
import { ChannelOverwritesService } from 'src/services/channelOverwrites.service';

dotenv.config();

export const assignNewRole = async (
  req: Request,
  id: string,
  channel: string,
  role: string,
  usersService: UsersService,
  serversService: ServersService,
  rolesService: RolesService,
  channelsService: ChannelsService,
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

    if (!role) {
      throw new BadRequestException('Missing Params');
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

    const roleRow = await rolesService.findById(role);
    if (roleRow.length === 0) {
      throw new BadRequestException('No such role');
    }

    const exists = await channelOverService.findById(
      channelRow[0].id,
      roleRow[0].role_id,
    );
    if (exists.length > 0) {
      throw new BadRequestException(
        'That role is already existing in overwrites',
      );
    }

    await channelOverService.createChannelOverwrite(
      channelRow[0].id,
      roleRow[0].role_id,
      [],
      [],
    );

    return {
      valid: true,
      message: 'Assigned New Role.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in assigning new role: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
