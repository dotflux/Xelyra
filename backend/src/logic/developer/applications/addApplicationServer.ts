import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import { ServersService } from 'src/services/servers.service';
import { ServerAppsService } from 'src/services/serverApps.service';

dotenv.config();

export const addApplicationServer = async (
  req: Request,
  server: string,
  id: string,
  usersService: UsersService,
  appService: ApplicationsService,
  serversService: ServersService,
  serverAppsService: ServerAppsService,
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
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    const serverRow = await serversService.findById(server);
    if (serverRow.length === 0) {
      throw new BadRequestException('No such server');
    }

    const exists = await serverAppsService.findById(
      serverRow[0].id,
      app[0].app_id,
    );
    if (exists.length > 0) {
      throw new BadRequestException('App is already in server');
    }

    await serverAppsService.createServerApp(serverRow[0].id, app[0].app_id, []);

    return {
      valid: true,
      message: 'Added Application.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in adding application.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
