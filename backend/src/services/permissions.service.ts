import { Injectable } from '@nestjs/common';
import { Permission } from './roles.service';
import { ServerMembersService } from './serverMembers.service';
import { ChannelOverwritesService } from './channelOverwrites.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly serverMemberService: ServerMembersService,
    private readonly channelOverService: ChannelOverwritesService,
  ) {}

  async canView(
    serverId: string,
    channelId: string,
    userId: string,
    isPrivate: boolean,
  ) {
    let effective = !isPrivate;

    // 2) Load the user’s roles
    const userRow = await this.serverMemberService.findById(serverId, userId);
    if (
      userRow.length === 0 ||
      !userRow[0].roles ||
      userRow[0].roles.length === 0
    ) {
      return effective; // no roles: just public/private logic
    }
    const roleIds = userRow[0].roles;

    const everyoneId = serverId;
    const targets = [everyoneId, ...roleIds, userId];

    // 4) Fetch only those overwrites
    const ovs = await this.channelOverService.findRelevantOverwrites(
      channelId,
      targets,
    );

    for (const { deny } of ovs) {
      if (deny.includes('VIEW_CHANNEL')) {
        effective = false;
      }
    }
    for (const { allow } of ovs) {
      if (allow.includes('VIEW_CHANNEL')) {
        effective = true;
      }
    }

    return effective;
  }

  async canManage(
    serverId: string,
    channelId: string,
    userId: string,
    isPrivate: boolean,
  ) {
    // 1) Default: public channels are viewable
    let effective = !isPrivate;

    // 2) Load the user’s roles
    const userRow = await this.serverMemberService.findById(serverId, userId);
    if (
      userRow.length === 0 ||
      !userRow[0].roles ||
      userRow[0].roles.length === 0
    ) {
      return effective; // no roles: just public/private logic
    }
    const roleIds = userRow[0].roles;

    const everyoneId = serverId;
    const targets = [everyoneId, ...roleIds, userId];

    // 4) Fetch only those overwrites
    const ovs = await this.channelOverService.findRelevantOverwrites(
      channelId,
      targets,
    );

    for (const { deny } of ovs) {
      if (deny.includes('MANAGE_CHANNEL')) {
        effective = false;
      }
    }
    for (const { allow } of ovs) {
      if (allow.includes('MANAGE_CHANNEL')) {
        effective = true;
      }
    }

    return effective;
  }
}
