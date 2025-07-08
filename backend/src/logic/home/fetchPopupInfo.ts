import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { BotsService } from 'src/services/bots.service';
import { ApplicationsService } from 'src/services/applications.service';
import { MessagesService } from 'src/services/messages.service';

dotenv.config();

export interface SenderInfo {
  username: string;
  displayName: string;
  type: string;
  pfp: string;
  description: string;
}

export const fetchPopupInfo = async (
  req: Request,
  userToFetch: string,
  usersService: UsersService,
  botsService: BotsService,
  appService: ApplicationsService,
  messagesService: MessagesService,
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

    const senderRow = await usersService.findById(userToFetch);
    const botRow = await botsService.findById(userToFetch);
    if (senderRow.length === 0 && botRow.length === 0) {
      throw new BadRequestException('No such user in database');
    }
    const isUser = senderRow.length > 0;

    let appName = '';
    let appPfp = '';
    let appDescription = '';
    if (botRow.length > 0) {
      const app = await appService.findById(botRow[0].app_id);
      if (app.length === 0) {
        throw new BadRequestException('No such app');
      }
      appName = app[0].name;
      appPfp = app[0].pfp;
      appDescription = app[0].description;
    }

    const senderInfo: SenderInfo = {
      username: isUser ? senderRow[0].username : appName,
      displayName: isUser ? senderRow[0].display_name : '',
      type: isUser
        ? 'user'
        : botRow[0].bot_id.toString() === (process.env.AI_ID as string)
          ? 'ai'
          : 'bot',
      pfp: isUser ? senderRow[0].pfp : appPfp,
      description: isUser ? senderRow[0].bio : appDescription,
    };

    return {
      valid: true,
      message: 'Sender Info fetched.',
      senderData: senderInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching sender info: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
