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

export const banMember = async (
  req: Request,
  serverId: string,
  banee: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  serverMembersService: ServerMembersService,
  channelsService: ChannelsService,
  permissionsService: PermissionsService,
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

    if (user[0].id.toString() === banee) {
      throw new BadRequestException('You cannot ban yourself');
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
    const banerIsOwner = server[0].owner.toString() === user[0].id.toString();
    if (!canBan && !isAdmin && !banerIsOwner) {
      throw new BadRequestException('You do not have permission to do this');
    }

    const baneeMember = await serverMembersService.findById(serverId, banee);
    if (baneeMember.length === 0) {
      throw new BadRequestException(
        'The person you wish to ban is not a member',
      );
    }
    const baneeUser = await usersService.findById(baneeMember[0].user_id);
    if (baneeUser.length === 0) {
      throw new BadRequestException('No such user in database');
    }

    const cantBeKicked = await permissionsService.canDo(
      serverId,
      banee,
      'ADMIN',
    );

    const isBanned = await serversService.findBan(serverId, banee);
    if (isBanned.length > 0) {
      throw new BadRequestException('User is already banned');
    }

    const isOwner = server[0].owner.toString() === banee;

    if ((cantBeKicked || isOwner) && !banerIsOwner) {
      throw new BadRequestException(
        'The person you wish to ban cannot be banned',
      );
    }

    await Promise.all([
      serverMembersService.removeMember(serverId, baneeUser[0].id),
      usersService.removeServer(serverId, baneeUser[0].id),
      serversService.createBan(serverId, baneeUser[0].id),
    ]);

    return {
      valid: true,
      message: 'Banned From Server.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in banning from server.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
