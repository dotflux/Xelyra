import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { RolesService } from 'src/services/roles.service';
import { ServerMembersService } from 'src/services/serverMembers.service';

dotenv.config();

export const assignRole = async (
  req: Request,
  id: string,
  role: string,
  userId: string,
  usersService: UsersService,
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

    if (!role || !userId) {
      throw new BadRequestException('Missing Params');
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

    const assignee = await usersService.findById(userId);
    if (assignee.length === 0) {
      throw new BadRequestException('No such user');
    }

    const isAssigneeMember = await serverMemberService.findById(
      server[0].id,
      assignee[0].id,
    );
    if (isAssigneeMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }

    console.log(isAssigneeMember[0].roles);

    const roleRow = await rolesService.findById(role);
    if (roleRow.length === 0) {
      throw new BadRequestException('No such role');
    }

    if (
      isAssigneeMember[0].roles &&
      isAssigneeMember[0].roles
        .map((p) => p.toString())
        .includes(roleRow[0].role_id.toString())
    ) {
      throw new BadRequestException('That member already has the role');
    }

    await serverMemberService.assignRole(
      server[0].id,
      assignee[0].id,
      roleRow[0].role_id,
    );

    return {
      valid: true,
      message: 'Assigned Role.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in assigning role: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
