import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagesService } from './messages.service';
import { Request, Response } from 'express';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { ServersService } from './servers.service';
import { ServerMembersService } from './serverMembers.service';
import { ChannelsService } from './channels.service';
import { RolesService, Permission } from './roles.service';
import { UserPermissionsService } from './userPermissions.service';
import { ChannelOverwritesService } from './channelOverwrites.service';
import { PermissionsService } from './permissions.service';
import { createApplication } from 'src/logic/developer/applications/createApplication';
import { ApplicationsService } from './applications.service';
import { BotsService } from './bots.service';
import { SlashCommandsService, SlashOption } from './slashCommands.service';
import { createBot } from 'src/logic/developer/bots/createBot';
import { createSlashCommand } from 'src/logic/developer/applications/createSlashCommand';
import { dispatchSlashCommand } from 'src/logic/developer/applications/dispatchSlashCommand';
import { BotsGateway } from 'src/gateways/bots.gateway';
import { ServerAppsService } from './serverApps.service';
import { addApplicationServer } from 'src/logic/developer/applications/addApplicationServer';
import { fetchSlashCommands } from 'src/logic/developer/applications/fetchSlashCommands';
import { devAuth } from 'src/logic/developer/devAuth';
import { fetchApplications } from 'src/logic/developer/applications/fetchApplication';
import { applicationAuth } from 'src/logic/developer/applications/applicationAuth';
import { fetchAppOverview } from 'src/logic/developer/applications/appSettings/fetchAppOverview';
import { fetchAppBot } from 'src/logic/developer/applications/appSettings/fetchAppBot';
import { updateAppOverview } from 'src/logic/developer/applications/appSettings/updateAppOverview';
import { fetchBotToken } from 'src/logic/developer/bots/fetchBotToken';
import { fetchCommandInfo } from 'src/logic/developer/bots/fetchCommandInfo';
import { updateAppPfp } from 'src/logic/developer/applications/appSettings/updateAppPfp';

@Injectable()
export class DeveloperService {
  constructor(
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
    private readonly serversService: ServersService,
    private readonly serverMembersService: ServerMembersService,
    private readonly channelsService: ChannelsService,
    private readonly rolesService: RolesService,
    private readonly userPermsService: UserPermissionsService,
    private readonly channelOverService: ChannelOverwritesService,
    private readonly permissionsService: PermissionsService,
    private readonly appService: ApplicationsService,
    private readonly botsService: BotsService,
    private readonly slashCmdService: SlashCommandsService,
    private readonly botsGateway: BotsGateway,
    private readonly serverAppsService: ServerAppsService,
  ) {}

  async devAuth(req: Request) {
    return await devAuth(req, this.usersService);
  }

  async createApplication(req: Request, name: string, description: string) {
    return await createApplication(
      req,
      name,
      description,
      this.usersService,
      this.appService,
    );
  }

  async fetchApplications(req: Request) {
    return await fetchApplications(req, this.usersService, this.appService);
  }

  async applicationAuth(req: Request, id: string) {
    return await applicationAuth(req, id, this.usersService, this.appService);
  }

  async fetchAppOverview(req: Request, id: string) {
    return await fetchAppOverview(
      req,
      id,
      this.usersService,
      this.appService,
      this.serverAppsService,
    );
  }

  async fetchAppBot(req: Request, id: string) {
    return await fetchAppBot(
      req,
      id,
      this.usersService,
      this.appService,
      this.botsService,
    );
  }

  async updateAppOverview(
    req: Request,
    id: string,
    name: string,
    description: string,
  ) {
    return await updateAppOverview(
      req,
      id,
      name,
      description,
      this.usersService,
      this.appService,
      this.serverAppsService,
    );
  }

  async createBot(req: Request, id: string) {
    return await createBot(
      req,
      id,
      this.usersService,
      this.appService,
      this.botsService,
    );
  }

  async fetchBotToken(req: Request, id: string, password: string) {
    return await fetchBotToken(
      req,
      id,
      password,
      this.usersService,
      this.appService,
      this.botsService,
    );
  }

  async createSlashCommand(
    req: Request,
    id: string,
    command: string,
    description: string,
    options: SlashOption[],
  ) {
    return await createSlashCommand(
      req,
      id,
      command,
      description,
      options,
      this.usersService,
      this.appService,
      this.slashCmdService,
    );
  }

  async dispatchSlashCommand(
    req: Request,
    id: string,
    command: string,
    channelId: string,
    options: SlashOption[],
  ) {
    return await dispatchSlashCommand(
      req,
      id,
      command,
      channelId,
      options,
      this.usersService,
      this.appService,
      this.slashCmdService,
      this.botsService,
      this.botsGateway,
      this.channelsService,
      this.serverMembersService,
      this.serversService,
    );
  }

  async addApplicationServer(req: Request, id: string, server: string) {
    return await addApplicationServer(
      req,
      server,
      id,
      this.usersService,
      this.appService,
      this.serversService,
      this.serverAppsService,
    );
  }

  async fetchSlashCommands(
    req: Request,
    server: string,
    search: string,
    limit: number,
    offset: number,
  ) {
    return await fetchSlashCommands(
      req,
      server,
      search,
      limit,
      offset,
      this.usersService,
      this.appService,
      this.serversService,
      this.serverAppsService,
      this.slashCmdService,
    );
  }

  async fetchCommandInfo(req: Request, id: string, conversation: string) {
    return await fetchCommandInfo(
      req,
      id,
      conversation,
      this.usersService,
      this.appService,
      this.messagesService,
      this.slashCmdService,
      this.botsService,
      this.channelsService,
    );
  }

  async updateAppPfp(req: Request, id: string, file: any) {
    return await updateAppPfp(
      req,
      id,
      file,
      this.usersService,
      this.appService,
    );
  }
}
