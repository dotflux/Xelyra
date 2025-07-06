import { Body, Controller, Post, Res, Req, Param } from '@nestjs/common';
import { ServersFunctionService } from 'src/services/serversFunction.service';
import { Request, Response } from 'express';
import { Permission } from 'src/services/roles.service';

@Controller('servers/:id')
export class ServerController {
  constructor(private readonly serverFservice: ServersFunctionService) {}

  @Post('')
  async fetchServer(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.fetchServer(req, id);
  }

  @Post('channels')
  async listChannels(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.listChannels(req, id);
  }

  @Post('category/create')
  async createCategory(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return await this.serverFservice.createCategory(req, id, name);
  }

  @Post('channels/create')
  async createChannel(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('category') category: string,
  ) {
    return await this.serverFservice.createChannel(
      req,
      id,
      name,
      type,
      category,
    );
  }

  @Post('roles/create')
  async createRole(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('template') template: string,
    @Body('permissions') permissions: Permission[],
  ) {
    return await this.serverFservice.createRole(
      req,
      id,
      name,
      template,
      permissions,
    );
  }

  @Post('roles/fetch')
  async fetchRoles(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.fetchRoles(req, id);
  }

  @Post('roles/assign')
  async assignRole(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('role') role: string,
  ) {
    return await this.serverFservice.assignRole(req, id, userId, role);
  }

  @Post('roles/remove')
  async removeRole(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('role') role: string,
  ) {
    return await this.serverFservice.removeRole(req, id, userId, role);
  }

  @Post('channels/:channel/permissions/assign')
  async assignPermission(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('channel') channel: string,
    @Body('updates')
    updates: {
      role: string;
      allow: Permission[];
      deny: Permission[];
    }[],
  ) {
    return await this.serverFservice.assignPermission(
      req,
      id,
      channel,
      updates,
    );
  }

  @Post('channels/:channel/permissions/new')
  async assignNewPermission(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('channel') channel: string,
    @Body('role_id') role_id: string,
  ) {
    return await this.serverFservice.assignNewRole(req, id, channel, role_id);
  }

  @Post('channels/:channel/settings/fetch')
  async fetchChannelSettings(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('channel') channel: string,
  ) {
    return await this.serverFservice.fetchChannelSettings(req, id, channel);
  }
}
