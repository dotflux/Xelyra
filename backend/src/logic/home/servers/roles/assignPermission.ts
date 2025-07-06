import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServersService } from 'src/services/servers.service';
import { RolesService, Permission } from 'src/services/roles.service';
import { ChannelOverwritesService } from 'src/services/channelOverwrites.service';
import { ChannelsService } from 'src/services/channels.service';
import { ServerMembersService } from 'src/services/serverMembers.service';

dotenv.config();

export function diffSets<T>(current: T[], next: T[]) {
  const cur = new Set<T>(current || []);
  const nxt = new Set<T>(next || []);
  const toAdd = next.filter((item) => !cur.has(item));
  const toRemove = current.filter((item) => !nxt.has(item));
  return { toAdd, toRemove };
}

export const assignPermission = async (
  req: Request,
  id: string,
  channel: string,
  updates: {
    role: string;
    allow: Permission[];
    deny: Permission[];
  }[],
  usersService: UsersService,
  serversService: ServersService,
  rolesService: RolesService,
  channelOverService: ChannelOverwritesService,
  channelsService: ChannelsService,
  serverMemberService: ServerMembersService,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

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

    const server = await serversService.findById(id);
    if (server.length === 0) {
      throw new BadRequestException('No such server');
    }

    const channelRow = await channelsService.findById(channel);
    if (channelRow.length === 0) {
      throw new BadRequestException('No such channel');
    }

    const isMember = await serverMemberService.findById(
      server[0].id,
      user[0].id,
    );
    if (isMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }

    const roleLookups = await Promise.all(
      updates.map((u) => rolesService.findById(u.role)),
    );
    const validUpdates = updates
      .map((u, i) => ({ upd: u, row: roleLookups[i] }))
      .filter((x) => x.row.length > 0)
      .map((x) => ({
        roleId: x.row[0].role_id,
        allow: x.upd.allow,
        deny: x.upd.deny,
      }));

    const existingRows =
      await channelOverService.findAllChannelOverwrites(channel);

    const toCreate: typeof validUpdates = [];
    const toUpdate: Array<{
      roleId: string;
      allowToAdd: Permission[];
      allowToRemove: Permission[];
      denyToAdd: Permission[];
      denyToRemove: Permission[];
    }> = [];

    for (const { roleId, allow, deny } of validUpdates) {
      const current = existingRows.find((r) => r.target_id === roleId);
      if (!current) {
        toCreate.push({ roleId: roleId, allow, deny });
      } else {
        const { toAdd: allowToAdd, toRemove: allowToRemove } = diffSets(
          current.allow,
          allow,
        );
        const { toAdd: denyToAdd, toRemove: denyToRemove } = diffSets(
          current.deny,
          deny,
        );

        if (
          allowToAdd.length ||
          allowToRemove.length ||
          denyToAdd.length ||
          denyToRemove.length
        ) {
          toUpdate.push({
            roleId,
            allowToAdd,
            allowToRemove,
            denyToAdd,
            denyToRemove,
          });
        }
      }
    }

    await Promise.all([
      ...toCreate.map(({ roleId, allow, deny }) =>
        channelOverService.createChannelOverwrite(channel, roleId, allow, deny),
      ),
      ...toUpdate.map(
        ({ roleId, allowToAdd, allowToRemove, denyToAdd, denyToRemove }) =>
          channelOverService.updateOverwrite(
            channel,
            roleId,
            allowToAdd,
            allowToRemove,
            denyToAdd,
            denyToRemove,
          ),
      ),
    ]);

    return {
      valid: true,
      message: 'Assigned Permission.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in assigning role permission.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
