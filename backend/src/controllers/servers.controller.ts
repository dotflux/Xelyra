import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ServersFunctionService } from 'src/services/serversFunction.service';
import { Request, Response } from 'express';
import { Permission } from 'src/services/roles.service';
import { updateServerPfp } from 'src/logic/home/servers/updateServerPfp';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('servers/:id')
export class ServerController {
  constructor(
    private readonly serverFservice: ServersFunctionService,
    private readonly usersService: UsersService,
    private readonly serversService: ServersService,
  ) {}

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
    @Body('color') color: string,
    @Body('template') template: string,
    @Body('permissions') permissions: Permission[],
  ) {
    return await this.serverFservice.createRole(
      req,
      id,
      name,
      color,
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

  @Post('add')
  async addToServer(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('inviteId') inviteId: string,
  ) {
    return await this.serverFservice.addToServer(req, id, inviteId);
  }

  @Post('leave')
  async leaveServer(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.leaveServer(req, id);
  }

  @Post('roles/rename')
  async renameRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @Body('newName') newName: string,
  ) {
    return await this.serverFservice.renameRole(id, roleId, newName);
  }

  @Post('roles/color')
  async changeRoleColor(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @Body('color') color: string,
  ) {
    return await this.serverFservice.changeRoleColor(id, roleId, color);
  }

  @Post('roles/permissions')
  async updateRolePermissions(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @Body('permissions') permissions: string[],
  ) {
    return await this.serverFservice.updateRolePermissions(
      id,
      roleId,
      permissions,
    );
  }

  @Post('update')
  async updateServerInfo(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('pfp') pfp: string,
  ) {
    return await this.serverFservice.updateServerInfo(id, { name, pfp });
  }

  @Post('pfp')
  @UseInterceptors(FileInterceptor('file'))
  async updateServerPfp(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return await updateServerPfp(
      req,
      id,
      file,
      this.usersService,
      this.serversService,
    );
  }

  @Post('invites/create')
  async createInvite(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.createInvite(req, id);
  }

  @Post('invites/find')
  async findInvite(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.findInvite(req, id);
  }

  @Post('members/fetch')
  async fetchMembers(@Req() req: Request, @Param('id') id: string) {
    return await this.serverFservice.fetchMembers(req, id);
  }

  @Post('members/kick')
  async kickMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('kickee') kickee: string,
  ) {
    return await this.serverFservice.kickMember(req, id, kickee);
  }
}
