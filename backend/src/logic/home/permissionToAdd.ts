import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { PermissionsService } from 'src/services/permissions.service';

dotenv.config();

export interface ServerInfo {
  name: string;
  id: string;
  pfp?: string;
}

export const permissionToAdd = async (
  req: Request,
  usersService: UsersService,
  serversService: ServersService,
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

    const serverInfo: ServerInfo[] = [];

    if (user[0].servers && user[0].servers.length > 0) {
      const serverChecks = user[0].servers.map(async (serverId: string) => {
        try {
          const server = await serversService.findById(serverId);
          if (server.length === 0) return null;

          const hasAdmin = await permissionsService.canDo(
            serverId,
            user[0].id,
            'ADMIN',
          );
          if (hasAdmin) {
            return {
              name: server[0].name,
              id: server[0].id,
              pfp: server[0].pfp,
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      });

      const results = await Promise.all(serverChecks);
      serverInfo.push(...results.filter(Boolean));
    }

    return {
      valid: true,
      message: 'Servers With Permission To Add Fetched.',
      serverData: serverInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching servers with permission to add: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
