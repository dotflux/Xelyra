import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import { ServerAppsService } from 'src/services/serverApps.service';

dotenv.config();

export interface AppInfo {
  app_name: string;
  description: string;
  count: number;
  app_id: string;
  pfp: string;
}

export const fetchAppOverview = async (
  req: Request,
  id: string,
  usersService: UsersService,
  appService: ApplicationsService,
  serverAppService: ServerAppsService,
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
    if (app[0].owner_id.toString() !== user[0].id.toString()) {
      throw new BadRequestException('Not your app');
    }

    const serverCount = await serverAppService.findAppServers(app[0].app_id);

    const appInfo: AppInfo = {
      app_name: app[0].name,
      description: app[0].description,
      count: serverCount.length,
      app_id: app[0].app_id,
      pfp: app[0].pfp,
    };

    return {
      valid: true,
      message: 'Fetched App Overview.',
      appInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching app overview: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
