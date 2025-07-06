import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationsService } from 'src/services/applications.service';
import {
  SlashCommandsService,
  SlashOption,
} from 'src/services/slashCommands.service';
import { MessagesService } from 'src/services/messages.service';
import { BotsService } from 'src/services/bots.service';
import { ConversationsService } from 'src/services/conversations.service';
import { ChannelsService } from 'src/services/channels.service';

dotenv.config();

export interface CommandInfo {
  app_name: string;
  command_name: string;
  sender_username: string;
}

export const fetchCommandInfo = async (
  req: Request,
  commandId: string,
  conversationId: string,
  usersService: UsersService,
  appService: ApplicationsService,
  messagesService: MessagesService,
  slashCmdService: SlashCommandsService,
  botsService: BotsService,
  channelsService: ChannelsService,
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
    if (!commandId) {
      throw new BadRequestException('Missing parameters');
    }

    const user = await usersService.findById(decoded?.id);
    if (user.length === 0) {
      throw new UnauthorizedException('No such user in database');
    }
    const conversation = await channelsService.findById(conversationId);
    if (conversation.length === 0) {
      throw new BadRequestException('No such conversation');
    }

    const command = await messagesService.findByCommandId(commandId);
    if (command.length === 0) {
      throw new BadRequestException('No such command');
    }
    const commandRow = await messagesService.findCommand(
      conversationId,
      command[0].created_at,
    );
    if (commandRow.length === 0) {
      throw new BadRequestException('No such command');
    }

    const bot = await botsService.findById(commandRow[0].bot_id);
    if (bot.length === 0) {
      throw new BadRequestException('No such bot');
    }

    const app = await appService.findById(bot[0].app_id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    const sender = await usersService.findById(commandRow[0].user);
    if (sender.length === 0) {
      throw new BadRequestException('No such sender');
    }

    const commandInfo: CommandInfo = {
      app_name: app[0].name,
      command_name: commandRow[0].command,
      sender_username: sender[0].username,
    };

    return {
      valid: true,
      message: 'Fetched Slash Command Info.',
      commandInfo: commandInfo,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching slash command info.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
