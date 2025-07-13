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
import { MessagesService } from './messages.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { ChannelsService } from './channels.service';
import { BotsService } from './bots.service';
import { ApplicationsService } from './applications.service';
import { createDm } from 'src/logic/home/createDm';
import { fetchReciever } from 'src/logic/home/fetchReciever';
import { fetchSender } from 'src/logic/home/fetchSender';
import { fetchMessages } from 'src/logic/home/fetchMessages';
import { sendMessage } from 'src/logic/home/sendMessage';
import { editMessage } from 'src/logic/home/editMessage';
import { deleteMessage } from 'src/logic/home/deleteMessage';
import { createGroup } from 'src/logic/home/group/createGroup';
import { groupAdd } from 'src/logic/home/group/groupAdd';
import { groupKick } from 'src/logic/home/group/groupKick';
import { groupLeave } from 'src/logic/home/group/groupLeave';
import { groupParticipants } from 'src/logic/home/group/groupParticipants';
import { ServerMembersService } from './serverMembers.service';
import { createServer } from 'src/logic/home/servers/createServer';
import { fetchGroupInfo } from 'src/logic/home/group/fetchGroupInfo';
import { changeGroupPfp } from 'src/logic/home/group/changeGroupPfp';
import { changeGroupName } from 'src/logic/home/group/changeGroupName';
import { listRequests } from 'src/logic/home/user/listRequests';
import { sendRequest } from 'src/logic/home/user/sendRequest';
import { acceptRequest } from 'src/logic/home/user/acceptRequest';
import { rejectRequest } from 'src/logic/home/user/rejectRequest';
import { cancelRequest } from 'src/logic/home/user/cancelRequest';
import { listSentRequests } from 'src/logic/home/user/listSentRequests';
import { fetchPopupInfo } from 'src/logic/home/fetchPopupInfo';
import { changeDisplayName } from 'src/logic/home/user/changeDisplayName';
import { changeBio } from 'src/logic/home/user/changeBio';
import { changeUsername } from 'src/logic/home/user/changeUsername';
import { changePassword } from 'src/logic/home/user/changePassword';

@Injectable()
export class HomeService {
  constructor(
    private readonly usersService: UsersService,
    private readonly conversationsService: ConversationsService,
    private readonly groupsService: GroupsService,
    private readonly serversService: ServersService,
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
    private readonly channelsService: ChannelsService,
    private readonly botsService: BotsService,
    private readonly appService: ApplicationsService,
    private readonly serverMembersService: ServerMembersService,
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

  async createDm(req: Request, recieverId: string) {
    return await createDm(
      req,
      recieverId,
      this.usersService,
      this.messagesService,
      this.conversationsService,
    );
  }

  async fetchReciever(req: Request, conversation: string) {
    return await fetchReciever(
      req,
      conversation,
      this.usersService,
      this.conversationsService,
      this.groupsService,
      this.channelsService,
    );
  }

  async fetchSender(req: Request, sender: string, reply_to?: string) {
    return await fetchSender(
      req,
      sender,
      this.usersService,
      this.botsService,
      this.appService,
      this.messagesService,
      reply_to,
    );
  }

  async fetchMessages(req: Request, conversation: string, cursor?: string) {
    return await fetchMessages(
      req,
      conversation,
      this.usersService,
      this.messagesService,
      this.conversationsService,
      this.groupsService,
      this.channelsService,
      cursor,
    );
  }

  async sendMessage(
    req: Request,
    message: string,
    conversation: string,
    replyTo?: string,
    files?: any[],
  ) {
    return await sendMessage(
      req,
      message,
      conversation,
      this.usersService,
      this.messagesService,
      this.conversationsService,
      this.messagesGateway,
      this.groupsService,
      this.channelsService,
      replyTo,
      files,
    );
  }

  async editMessage(
    req: Request,
    message: string,
    messageId: string,
    conversation: string,
  ) {
    return await editMessage(
      req,
      message,
      messageId,
      conversation,
      this.usersService,
      this.messagesService,
      this.conversationsService,
      this.messagesGateway,
      this.groupsService,
      this.channelsService,
      this.serverMembersService,
    );
  }

  async deleteMessage(req: Request, message: string, conversation: string) {
    return await deleteMessage(
      req,
      message,
      conversation,
      this.usersService,
      this.messagesService,
      this.conversationsService,
      this.messagesGateway,
      this.groupsService,
      this.channelsService,
      this.serverMembersService,
    );
  }

  async createGroup(req: Request, name: string, participants: string[]) {
    return await createGroup(
      req,
      name,
      participants,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }

  async fetchGroupInfo(req: Request, groupId: string) {
    return await fetchGroupInfo(
      req,
      groupId,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }
  async groupAdd(req: Request, group: string, participants: string[]) {
    return await groupAdd(
      req,
      group,
      participants,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }

  async groupKick(req: Request, group: string, participant: string) {
    return await groupKick(
      req,
      group,
      participant,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }

  async groupLeave(req: Request, group: string) {
    return await groupLeave(
      req,
      group,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }

  async groupParticipants(req: Request, group: string) {
    return await groupParticipants(
      req,
      group,
      this.usersService,
      this.messagesService,
      this.groupsService,
    );
  }

  async createServer(req: Request, name: string) {
    return await createServer(
      req,
      name,
      this.usersService,
      this.messagesService,
      this.serversService,
      this.serverMembersService,
      this.channelsService,
    );
  }

  async changeGroupPfp(
    req: Request,
    groupId: string,
    file?: any,
    imageUrl?: string,
  ) {
    return await changeGroupPfp(
      req,
      this.groupsService,
      groupId,
      this.usersService,
      file,
      imageUrl,
    );
  }

  async changeGroupName(req: Request, groupId: string, name: string) {
    return await changeGroupName(
      req,
      this.groupsService,
      groupId,
      name,
      this.usersService,
    );
  }

  async fetchRequests(req: Request) {
    return await listRequests(req, this.usersService);
  }

  async sendRequest(req: Request, recieverId: string) {
    return await sendRequest(req, recieverId, this.usersService);
  }

  async acceptRequest(req: Request, recieverId: string) {
    return await acceptRequest(req, recieverId, this.usersService);
  }

  async rejectRequest(req: Request, recieverId: string) {
    return await rejectRequest(req, recieverId, this.usersService);
  }

  async cancelRequest(req: Request, recieverId: string) {
    return await cancelRequest(req, recieverId, this.usersService);
  }

  async listSentRequests(req: Request) {
    return await listSentRequests(req, this.usersService);
  }

  async fetchPopupInfo(req: Request, userToFetch: string) {
    return await fetchPopupInfo(
      req,
      userToFetch,
      this.usersService,
      this.botsService,
      this.appService,
      this.messagesService,
    );
  }

  async changeDisplayName(req: Request, displayName: string) {
    return await changeDisplayName(
      req,
      displayName,
      this.usersService,
      this.messagesGateway,
    );
  }

  async changeBio(req: Request, bio: string) {
    return await changeBio(req, bio, this.usersService, this.messagesGateway);
  }

  async changeUsername(req: Request, username: string, password: string) {
    return await changeUsername(
      req,
      username,
      password,
      this.usersService,
      this.messagesGateway,
    );
  }

  async changePassword(
    req: Request,
    newPassword: string,
    currentPassword: string,
    confirmPassword: string,
  ) {
    return await changePassword(
      req,
      newPassword,
      currentPassword,
      confirmPassword,
      this.usersService,
      this.messagesGateway,
    );
  }
}
