import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationsService } from 'src/services/applications.service';
import { BotsService } from 'src/services/bots.service';
import { generateBotToken } from 'src/general_scripts/generateBotToken';

dotenv.config();

export interface BotInfo {
  bot_id: string;
}

export const createBot = async (
  req: Request,
  id: string,
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
    if (!id) {
      throw new UnauthorizedException('Missing parameters');
    }
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new UnauthorizedException('No such application');
    }
    const exists = await botsService.findByAppId(app[0].app_id);
    if (exists.length > 0) {
      throw new BadRequestException('A bot already exists within application');
    }

    const newId = uuidv4();
    const botToken = generateBotToken(id, newId);
    const scopes = ['bot', 'application.commands'];

    await Promise.all([
      botsService.createBot(app[0].app_id, newId, botToken, scopes),
      botsService.createTokenLookup(botToken, app[0].app_id, newId),
    ]);

    const botInfo: BotInfo = {
      bot_id: newId,
    };

    return {
      valid: true,
      message: 'Created Bot.',
      botInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating bot.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
