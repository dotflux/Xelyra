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
}

export const fetchSender = async (
  req: Request,
  sender: string,
  usersService: UsersService,
  botsService: BotsService,
  appService: ApplicationsService,
  messagesService: MessagesService,
  reply_to?: string,
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

    const senderRow = await usersService.findById(sender);
    const botRow = await botsService.findById(sender);
    if (senderRow.length === 0 && botRow.length === 0) {
      throw new BadRequestException('No such user in database');
    }
    const isUser = senderRow.length > 0;

    let appName = '';
    let appPfp = '';
    if (botRow.length > 0) {
      const app = await appService.findById(botRow[0].app_id);
      if (app.length === 0) {
        throw new BadRequestException('No such app');
      }
      appName = app[0].name;
      appPfp = app[0].pfp;
    }

    let repliedContent = null;
    let repliedUsername: string | null = null;
    let repliedPfp: string | null = null;
    let repliedDisplayName: string | null = null;

    if (reply_to) {
      const repliedMsg = await messagesService.findByTimeId(reply_to);
      if (repliedMsg.length > 0) {
        repliedContent = repliedMsg[0].message;
        const repliedUser = await usersService.findById(repliedMsg[0].user);
        if (repliedUser.length > 0) {
          repliedUsername = repliedUser[0].username;
          repliedPfp = repliedUser[0].pfp;
          repliedDisplayName = repliedUser[0].display_name;
        } else {
          const repliedBot = await botsService.findById(repliedMsg[0].user);
          if (repliedBot.length > 0) {
            let botDisplayName = repliedBot[0].name || null;
            if (repliedBot[0].app_id) {
              const botApp = await appService.findById(repliedBot[0].app_id);
              if (botApp.length > 0 && botApp[0].name) {
                botDisplayName = botApp[0].name;
              }
            }
            repliedUsername = botDisplayName || 'Bot';
            repliedPfp = repliedBot[0].pfp || null;
            repliedDisplayName = null;
          } else {
            repliedUsername = null;
            repliedPfp = null;
            repliedDisplayName = null;
          }
        }
      } else {
        repliedUsername = null;
        repliedPfp = null;
        repliedDisplayName = null;
        repliedContent = null;
      }
    } else {
      repliedUsername = null;
      repliedPfp = null;
      repliedDisplayName = null;
      repliedContent = null;
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
    };

    return {
      valid: true,
      message: 'Sender Info fetched.',
      senderData: senderInfo,
      repliedContent,
      repliedUsername,
      repliedPfp,
      repliedDisplayName,
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
