import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from '../../../services/users.service';
import { MessagesService } from '../../../services/messages.service';
import { ServersService } from '../../../services/servers.service';
import { ChannelsService } from '../../../services/channels.service';
import { PermissionsService } from '../../../services/permissions.service';
import { ServerMembersService } from '../../../services/serverMembers.service';
import { ConversationsService } from '../../../services/conversations.service';

dotenv.config();

export interface ChannelInfo {
  name: string;
  id: string;
  type: string;
  category: string;
  unreadCount: number;
}

export interface CategoryWithChannels {
  categoryName: string;
  category: string;
  channels: ChannelInfo[];
}

export const listChannels = async (
  req: Request,
  id: string,
  usersService: UsersService,
  messagesService: MessagesService,
  serversService: ServersService,
  channelsService: ChannelsService,
  permissionsService: PermissionsService,
  serverMemberService: ServerMembersService,
  conversationsService: ConversationsService,
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

    const isMember = await serverMemberService.findById(
      server[0].id,
      user[0].id,
    );
    if (isMember.length === 0) {
      throw new BadRequestException('You are not a member');
    }

    const [categories, allChannels] = await Promise.all([
      channelsService.findAllCategories(server[0].id),
      channelsService.findAllChannels(server[0].id),
    ]);

    if (categories.length === 0) {
      return {
        valid: true,
        message: 'Listed Channels.',
        channelsData: [],
      };
    }

    const channelsByCategory = new Map<string, ChannelInfo[]>();

    categories.forEach((category) => {
      channelsByCategory.set(String(category.id), []);
    });

    const permissionChecks = allChannels.map(async (channel) => {
      const canView = await permissionsService.canView(
        id,
        channel.id,
        user[0].id,
        channel.isPrivate,
      );

      if (channelsByCategory.has(String(channel.category))) {
        const unreadCounter = await conversationsService.findUnreadCounter(
          channel.id,
          user[0].id.toString(),
        );
        const unreadCount = unreadCounter.length;
        const channelInfo: ChannelInfo = {
          name: channel.name,
          id: channel.id,
          type: channel.type,
          category: String(channel.category),
          unreadCount,
        };
        channelsByCategory.get(String(channel.category))!.push(channelInfo);
      }
    });

    await Promise.all(permissionChecks);

    const channelsData: CategoryWithChannels[] = categories.map((category) => ({
      categoryName: category.name,
      category: String(category.id),
      channels: channelsByCategory.get(String(category.id)) || [],
    }));

    return {
      valid: true,
      message: 'Listed Channels.',
      channelsData,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in listing server channels.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
