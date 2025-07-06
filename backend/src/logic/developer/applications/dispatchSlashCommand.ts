import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import {
  SlashCommandsService,
  SlashOption,
} from 'src/services/slashCommands.service';
import { BotsService } from 'src/services/bots.service';
import { BotsGateway } from 'src/gateways/bots.gateway';
import { v4 as uuidv4 } from 'uuid';
import { ChannelsService } from 'src/services/channels.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ServersService } from 'src/services/servers.service';

dotenv.config();

export const dispatchSlashCommand = async (
  req: Request,
  id: string,
  command: string,
  channelId: string,
  options: SlashOption[],
  usersService: UsersService,
  appService: ApplicationsService,
  slashCmdService: SlashCommandsService,
  botsService: BotsService,
  botsGateway: BotsGateway,
  channelsService: ChannelsService,
  serverMemberService: ServerMembersService,
  serversService: ServersService,
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

    const channel = await channelsService.findById(channelId);
    if (channel.length === 0) {
      throw new BadRequestException('No such channel');
    }
    const server = await serversService.findById(channel[0].server_id);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }
    const isMember = await serverMemberService.findById(
      server[0].id,
      user[0].id,
    );
    if (isMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    if (!command || command.length === 0) {
      throw new BadRequestException('Missing parameters');
    }
    const commandRow = await slashCmdService.findCommand(
      app[0].app_id,
      command,
    );
    if (commandRow.length === 0) {
      throw new BadRequestException('No such command');
    }
    const bot = await botsService.findByAppId(app[0].app_id);
    if (bot.length === 0) {
      throw new BadRequestException('No such bot');
    }

    const args: Record<string, any> = {};
    for (const opt of options) {
      args[opt.name] = opt.value;
    }

    const payload = {
      appId: app[0].app_id,
      botId: bot[0].bot_id,
      command,
      channelId,
      userId: user[0].id,
      args,
      token: uuidv4(),
    };

    botsGateway.dispatchInteraction(payload);

    return {
      valid: true,
      message: 'Dispatched Slash Command.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in dispatching slash command.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
