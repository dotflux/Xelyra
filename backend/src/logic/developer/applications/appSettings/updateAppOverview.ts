import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import { ServerAppsService } from 'src/services/serverApps.service';

dotenv.config();

export interface NewInfo {
  app_name: string;
  description: string;
  count: number;
  app_id: string;
}

export const updateAppOverview = async (
  req: Request,
  id: string,
  name: string,
  description: string,
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
    if (app[0].name === name && app[0].description === description) {
      throw new BadRequestException('No changes detected');
    }

    await Promise.all([
      appService.updateName(app[0].app_id, name),
      appService.updateDescription(app[0].app_id, description),
    ]);

    const countServer = await serverAppService.findAppServers(app[0].app_id);

    const newInfo: NewInfo = {
      app_name: name,
      description,
      count: countServer.length,
      app_id: app[0].app_id,
    };

    return {
      valid: true,
      message: 'Updated app overview.',
      newInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in updating app overview: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
