import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';

dotenv.config();

export interface ServerInfo {
  name: string;
  id: string;
  pfp?: string;
}

export const fetchServers = async (
  req: Request,
  usersService: UsersService,
  serversService: ServersService,
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

    for (const server of user[0].servers || []) {
      const serverUser = await serversService.findById(server);
      if (serverUser.length === 0) {
        throw new BadRequestException('No such server in database');
      }

      serverInfo.push({
        name: serverUser[0].name,
        id: serverUser[0].id,
        pfp: serverUser[0].pfp
          ? `http://localhost:3000${serverUser[0].pfp}`
          : undefined,
      });
    }

    return {
      valid: true,
      message: 'Servers fetched.',
      serverData: serverInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching servers: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
