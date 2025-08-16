import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ServerMembersService } from 'src/services/serverMembers.service';
import { ServersService } from 'src/services/servers.service';
import { ChannelsService } from 'src/services/channels.service';
import { ConversationsService } from 'src/services/conversations.service';

dotenv.config();

export interface ParticipantInfo {
  username: string;
  id: string;
  pfp: string;
  displayName: string;
}

export const conversationParticipants = async (
  req: Request,
  conversation: string,
  usersService: UsersService,
  conversationsService: ConversationsService,
  serverMembersService: ServerMembersService,
  serversService: ServersService,
  channelsService: ChannelsService,
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

    const convRow = await conversationsService.findById(conversation);
    const channelRow = await channelsService.findById(conversation);
    if (convRow.length === 0 && channelRow.length === 0) {
      throw new BadRequestException('No such conversation');
    }
    const isChannel = channelRow.length > 0;
    const isDm = convRow.length > 0;
    const server = isChannel
      ? await serversService.findById(channelRow[0].server_id)
      : [];
    if (isChannel && server.length === 0) {
      throw new BadRequestException('No such server');
    }
    const isMember = isChannel
      ? await serverMembersService.findById(server[0].id, user[0].id)
      : [];
    if (isChannel && isMember.length === 0) {
      throw new BadRequestException('Not a member');
    }
    if (
      isDm &&
      !convRow[0].participants
        .map((m) => m.toString())
        .includes(user[0].id.toString())
    ) {
      throw new BadRequestException('You are not a participant');
    }

    const limit: number = req.body?.limit ? Number(req.body.limit) : 70;
    const afterId: string | undefined = req.body?.afterId;

    const partData: ParticipantInfo[] = [];

    if (isDm) {
      for (const participant of convRow[0].participants) {
        const participantUser = await usersService.findById(participant);
        if (participantUser.length === 0) {
          throw new BadRequestException('No such user in database');
        }

        partData.push({
          username: participantUser[0].username,
          id: participantUser[0].id,
          pfp: participantUser[0].pfp,
          displayName: participantUser[0].displayName,
        });
      }
    } else {
      const membersRaw = await serverMembersService.fetchBatch(
        server[0].id,
        limit,
        afterId,
      );
      if (!membersRaw || membersRaw.length === 0) {
        return { valid: true, message: 'No more participants', partData: [] };
      }

      const userRows = await Promise.all(
        membersRaw.map((m: any) => usersService.findById(m.user_id)),
      );
      membersRaw.map((m: any, idx: number) => {
        const u = userRows[idx][0] || {};
        partData.push({
          username: u.username || '',
          id: m.user_id,
          pfp: u.pfp || '',
          displayName: u.displayName || u.display_name || '',
        });
      });
    }

    return {
      valid: true,
      message: 'Participants fetched.',
      partData,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching conv participants.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
