import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConversationsService } from './conversations.service';
import { Request, Response } from 'express';
import { userAuth } from 'src/logic/home/userAuth';
import { GroupsService } from './groups.service';
import { ServersService } from './servers.service';
import { fetchFriends } from 'src/logic/home/fetchFriends';
import { fetchConversations } from 'src/logic/home/fetchConversations';
import { fetchServers } from 'src/logic/home/fetchServers';

@Injectable()
export class HomeService {
  constructor(
    private readonly usersService: UsersService,
    private readonly conversationsService: ConversationsService,
    private readonly groupsService: GroupsService,
    private readonly serversService: ServersService,
  ) {}

  async verifyUser(req: Request) {
    return await userAuth(req, this.usersService);
  }

  async fetchFriends(req: Request) {
    return await fetchFriends(
      req,
      this.usersService,
      this.conversationsService,
    );
  }

  async fetchConversations(req: Request) {
    return await fetchConversations(
      req,
      this.usersService,
      this.conversationsService,
      this.groupsService,
    );
  }

  async fetchServers(req: Request) {
    return await fetchServers(req, this.usersService, this.serversService);
  }
}
