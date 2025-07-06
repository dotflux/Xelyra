import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';

dotenv.config();

export interface Application {
  app_id: string;
  app_name: string;
}

export const fetchApplications = async (
  req: Request,
  usersService: UsersService,
  appService: ApplicationsService,
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

    const userApplications: Application[] = [];

    for (const app of user[0].applications) {
      const exists = await appService.findById(app);
      if (exists.length === 0) {
        continue;
      }
      userApplications.push({
        app_id: exists[0].app_id,
        app_name: exists[0].name,
      });
    }

    return {
      valid: true,
      message: 'User Applications Fetched',
      userApplications,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching applications: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
