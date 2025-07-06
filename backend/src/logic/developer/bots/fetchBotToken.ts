import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import { BotsService } from 'src/services/bots.service';
import * as bcrypt from 'bcrypt';

dotenv.config();

export const fetchBotToken = async (
  req: Request,
  id: string,
  password: string,
  usersService: UsersService,
  appService: ApplicationsService,
  botsService: BotsService,
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
    if (!password || password.length === 0) {
      throw new BadRequestException('This field is required');
    }
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      throw new BadRequestException('Incorrect Password');
    }
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    const bot = await botsService.findByAppId(app[0].app_id);
    if (bot.length === 0) {
      throw new BadRequestException('This app has no bot');
    }

    return {
      valid: true,
      message: 'Fetched Bot Token.',
      botToken: bot[0].token,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching bot token: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
