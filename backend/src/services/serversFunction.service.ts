import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagesService } from './messages.service';
import { Request, Response } from 'express';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { ServersService } from './servers.service';
import { ServerMembersService } from './serverMembers.service';
import { ChannelsService } from './channels.service';
import { RolesService } from './roles.service';
import { Permission } from './roles.service';
import { ChannelOverwritesService } from './channelOverwrites.service';
import { PermissionsService } from './permissions.service';
import { UserPermissionsService } from './userPermissions.service';
import { listChannels } from 'src/logic/home/servers/listChannels';
import { createChannel } from 'src/logic/home/servers/createChannel';
import { createRole } from 'src/logic/home/servers/roles/createRole';
import { assignRole } from 'src/logic/home/servers/roles/assignRole';
import { assignNewRole } from 'src/logic/home/servers/roles/assignNewRole';
import { removeRole } from 'src/logic/home/servers/roles/removeRole';
import { assignPermission } from 'src/logic/home/servers/roles/assignPermission';
import { fetchChannelSettings } from 'src/logic/home/servers/fetchChannelSetttings';
import { createCategory } from 'src/logic/home/servers/createCategory';
import { fetchServer } from 'src/logic/home/servers/fetchServer';
import { ConversationsService } from './conversations.service';
import { addToServer } from 'src/logic/home/servers/addToServer';
import { fetchRoles } from 'src/logic/home/servers/roles/fetchRole';
import { renameRole } from 'src/logic/home/servers/roles/renameRole';
import { changeRoleColor } from 'src/logic/home/servers/roles/changeRoleColor';
import { updateRolePermissions } from 'src/logic/home/servers/roles/updateRolePermissions';
import { updateServerInfo } from 'src/logic/home/servers/updateServerInfo';

@Injectable()
export class ServersFunctionService {
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
    private readonly conversationsService: ConversationsService,
  ) {}

  async fetchServer(req: Request, id: string) {
    return await fetchServer(
      req,
      id,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.serverMembersService,
    );
  }

  async listChannels(req: Request, id: string) {
    return await listChannels(
      req,
      id,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.channelsService,
      this.permissionsService,
      this.serverMembersService,
      this.conversationsService,
    );
  }

  async createCategory(req: Request, id: string, name: string) {
    return await createCategory(
      req,
      id,
      name,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.channelsService,
      this.serverMembersService,
    );
  }

  async createChannel(
    req: Request,
    id: string,
    name: string,
    type: string,
    category: string,
  ) {
    return await createChannel(
      req,
      id,
      name,
      type,
      category,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.channelsService,
      this.serverMembersService,
    );
  }

  async createRole(
    req: Request,
    id: string,
    name: string,
    color: string,
    template: string,
    permissions: Permission[],
  ) {
    return await createRole(
      req,
      id,
      name,
      color,
      template,
      permissions,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.rolesService,
      this.serverMembersService,
    );
  }

  async fetchRoles(req: Request, id: string) {
    return await fetchRoles(req, id, this.rolesService);
  }

  async assignRole(req: Request, id: string, userId: string, role: string) {
    return await assignRole(
      req,
      id,
      role,
      userId,
      this.usersService,
      this.serversService,
      this.rolesService,
      this.serverMembersService,
    );
  }

  async assignNewRole(req: Request, id: string, channel: string, role: string) {
    return await assignNewRole(
      req,
      id,
      channel,
      role,
      this.usersService,
      this.serversService,
      this.rolesService,
      this.channelsService,
      this.channelOverService,
      this.serverMembersService,
    );
  }

  async removeRole(req: Request, id: string, userId: string, role: string) {
    return await removeRole(
      req,
      id,
      role,
      userId,
      this.usersService,
      this.serversService,
      this.rolesService,
      this.serverMembersService,
    );
  }

  async assignPermission(
    req: Request,
    id: string,
    channel: string,
    updates: {
      role: string;
      allow: Permission[];
      deny: Permission[];
    }[],
  ) {
    return await assignPermission(
      req,
      id,
      channel,
      updates,
      this.usersService,
      this.serversService,
      this.rolesService,
      this.channelOverService,
      this.channelsService,
      this.serverMembersService,
    );
  }

  async fetchChannelSettings(req: Request, id: string, channel: string) {
    return await fetchChannelSettings(
      req,
      id,
      channel,
      this.usersService,
      this.serversService,
      this.channelsService,
      this.rolesService,
      this.permissionsService,
      this.channelOverService,
      this.serverMembersService,
    );
  }

  async addToServer(req: Request, id: string, inviteId: string) {
    return await addToServer(
      req,
      id,
      inviteId,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.serverMembersService,
      this.channelsService,
    );
  }

  async renameRole(serverId: string, roleId: string, newName: string) {
    return await renameRole(serverId, roleId, newName, this.rolesService);
  }

  async changeRoleColor(serverId: string, roleId: string, color: string) {
    return await changeRoleColor(serverId, roleId, color, this.rolesService);
  }

  async updateRolePermissions(
    serverId: string,
    roleId: string,
    permissions: string[],
  ) {
    return await updateRolePermissions(
      serverId,
      roleId,
      permissions,
      this.rolesService,
    );
  }

  async updateServerInfo(
    serverId: string,
    updates: { name?: string; pfp?: string },
  ) {
    return await updateServerInfo(serverId, updates, this.serversService);
  }
}
