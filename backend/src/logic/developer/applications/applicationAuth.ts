import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';

dotenv.config();

export const applicationAuth = async (
  req: Request,
  id: string,
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
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    if (app[0].owner_id.toString() !== user[0].id.toString()) {
      throw new BadRequestException('Not your app');
    }

    return {
      valid: true,
      message: 'Valid Application.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in application token auth: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
