import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import { ServersService } from 'src/services/servers.service';
import { ServerAppsService } from 'src/services/serverApps.service';
import { SlashCommandsService } from 'src/services/slashCommands.service';

dotenv.config();

export interface Option {
  name: string;
  type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER';
  description: string;
  required: boolean;
}

export interface SlashCommand {
  name: string;
  description: string;
  app_name: string;
  app_id: string;
  options: Option[];
}

export const fetchSlashCommands = async (
  req: Request,
  server: string,
  search: string,
  limit: number,
  offset: number,
  usersService: UsersService,
  appService: ApplicationsService,
  serversService: ServersService,
  serverAppsService: ServerAppsService,
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

    const user = await usersService.findById(decoded?.id);
    if (user.length === 0) {
      throw new UnauthorizedException('No such user in database');
    }
    const serverRow = await serversService.findById(server);
    if (serverRow.length === 0) {
      throw new BadRequestException('No such server');
    }

    const allApps = await serverAppsService.findAll(serverRow[0].id);
    if (allApps.length === 0) {
      throw new BadRequestException('No such apps in server');
      //return { valid: true, message: 'No apps installed.', commands: [] };
    }

    if (!search) {
      search = '';
    }
    if (!limit) {
      limit = 10;
    }
    if (!offset) {
      offset = 0;
    }

    const perAppResults = await Promise.all(
      allApps.map(async (sa) => {
        // Fetch app info and its slash commands in parallel
        const [apps, cmdRowsRaw] = await Promise.all([
          appService.findById(sa.app_id),
          slashCmdService.findAllCommands(sa.app_id),
        ]);

        if (!apps.length) return [];

        const appName = apps[0].name;

        // Optional filtering if search is given
        let cmdRows = cmdRowsRaw;
        if (search) {
          const lower = search.toLowerCase();
          cmdRows = cmdRows.filter((cmd) =>
            cmd.command.toLowerCase().includes(lower),
          );
        }

        // Apply pagination manually
        const pagedCmds = cmdRows.slice(offset, offset + limit);

        // Convert to frontend format
        return pagedCmds.map((cmd) => ({
          name: cmd.command,
          description: cmd.description,
          app_id: cmd.app_id,
          app_name: appName,
          options: JSON.parse(cmd.options),
        }));
      }),
    );

    const commands = perAppResults
      .flat()
      .sort((a, b) =>
        a.app_name === b.app_name
          ? a.name.localeCompare(b.name)
          : a.app_name.localeCompare(b.app_name),
      );

    return {
      valid: true,
      message: 'Fetched Application Commands.',
      commands,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching application commands.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
