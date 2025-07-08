import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ServersService } from 'src/services/servers.service';
import { v4 as uuidv4 } from 'uuid';
import { RolesService, Permission } from 'src/services/roles.service';
import { types } from 'cassandra-driver';
import { ServerMembersService } from 'src/services/serverMembers.service';

dotenv.config();

export const createRole = async (
  req: Request,
  id: string,
  name: string,
  colour: string,
  template: string,
  permissions: Permission[],
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  rolesService: RolesService,
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

    let lv = 0;

    const finalName = name.length > 0 ? name : 'new-role';

    const finalPermissions: Permission[] =
      permissions && permissions.length > 0
        ? permissions
        : ['VIEW_CHANNEL', 'SEND_MESSAGES'];

    const newId = uuidv4();

    console.log(typeof 0);

    await rolesService.createRole(
      server[0].id,
      newId,
      finalName,
      lv,
      colour ? colour : '#374151',
      finalPermissions,
    );

    return {
      valid: true,
      message: 'Created Role.',
      newId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating role.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
