import { Body, Controller, Post, Res, Req, Param } from '@nestjs/common';
import { DeveloperService } from 'src/services/developer.service';
import { Request, Response } from 'express';
import { Permission } from 'src/services/roles.service';
import { SlashOption } from 'src/services/slashCommands.service';

@Controller('developer')
export class DeveloperController {
  constructor(private readonly devService: DeveloperService) {}

  @Post('auth')
  async devAuth(@Req() req: Request) {
    return await this.devService.devAuth(req);
  }

  @Post('applications/create')
  async createApplication(
    @Req() req: Request,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    return await this.devService.createApplication(req, name, description);
  }

  @Post('applications/fetch')
  async fetchApplications(@Req() req: Request) {
    return await this.devService.fetchApplications(req);
  }

  @Post('applications/:id/fetch/overview')
  async fetchAppOverview(@Req() req: Request, @Param('id') id: string) {
    return await this.devService.fetchAppOverview(req, id);
  }

  @Post('applications/:id/fetch/bot')
  async fetchAppBot(@Req() req: Request, @Param('id') id: string) {
    return await this.devService.fetchAppBot(req, id);
  }

  @Post('applications/:id/auth')
  async applicationAuth(@Req() req: Request, @Param('id') id: string) {
    return await this.devService.applicationAuth(req, id);
  }

  @Post('applications/:id/update/overview')
  async updateAppOverview(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
  ) {
    return await this.devService.updateAppOverview(req, id, name, description);
  }

  @Post('applications/:id/bots/create')
  async createBot(@Req() req: Request, @Param('id') id: string) {
    return await this.devService.createBot(req, id);
  }

  @Post('applications/:id/bots/fetchToken')
  async fetchBotToken(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return await this.devService.fetchBotToken(req, id, password);
  }

  @Post('applications/:id/commands/create')
  async createSlashCommand(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('command') command: string,
    @Body('description') description: string,
    @Body('options') options: SlashOption[],
  ) {
    return await this.devService.createSlashCommand(
      req,
      id,
      command,
      description,
      options,
    );
  }

  @Post('applications/:id/commands/dispatch')
  async dispatchSlashCommand(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('command') command: string,
    @Body('channelId') channelId: string,
    @Body('options') options: SlashOption[],
  ) {
    return await this.devService.dispatchSlashCommand(
      req,
      id,
      command,
      channelId,
      options,
    );
  }

  @Post('applications/:id/add/:server')
  async addApplicationServer(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('server') server: string,
  ) {
    return await this.devService.addApplicationServer(req, id, server);
  }

  @Post('servers/:id/')
  async fetchSlashCommands(
    @Req() req: Request,
    @Param('id') server: string,
    @Body('search') search: string,
    @Body('limit') limit: number,
    @Body('offset') offset: number,
  ) {
    return await this.devService.fetchSlashCommands(
      req,
      server,
      search,
      limit,
      offset,
    );
  }

  @Post('commands/:id/conversation/:conversation/fetch/info')
  async fetchCommandInfo(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('conversation') conversation: string,
  ) {
    return await this.devService.fetchCommandInfo(req, id, conversation);
  }
}
