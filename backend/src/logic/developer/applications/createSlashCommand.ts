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

dotenv.config();

export const createSlashCommand = async (
  req: Request,
  id: string,
  command: string,
  description: string,
  options: SlashOption[],
  usersService: UsersService,
  appService: ApplicationsService,
  slashCmdService: SlashCommandsService,
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
    if (!id) {
      throw new BadRequestException('Missing parameters');
    }

    const user = await usersService.findById(decoded?.id);
    if (user.length === 0) {
      throw new UnauthorizedException('No such user in database');
    }
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }

    if (!command || command.length === 0) {
      throw new BadRequestException('Name is required');
    }
    if (command.length > 20) {
      throw new BadRequestException('Name must not exceed 20 characters');
    }

    if (description && description.length > 80) {
      throw new BadRequestException(
        'Description must not exceed 80 characters',
      );
    }

    const optionsFied = options.length > 0 ? JSON.stringify(options) : '[]';

    await slashCmdService.createSlashCmd(
      app[0].app_id,
      command,
      description,
      optionsFied,
    );

    return {
      valid: true,
      message: 'Created Slash Command.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating slash command.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
