import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { HomeService } from 'src/services/home.service';
import { Request, Response } from 'express';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Post('auth')
  async verifyUser(@Req() req: Request) {
    return await this.homeService.verifyUser(req);
  }
  @Post('friends')
  async fetchFriends(@Req() req: Request) {
    return await this.homeService.fetchFriends(req);
  }

  @Post('conversations')
  async fetchConversations(@Req() req: Request) {
    return await this.homeService.fetchConversations(req);
  }

  @Post('servers')
  async fetchServers(@Req() req: Request) {
    return await this.homeService.fetchServers(req);
  }

  @Post('dm')
  async createDm(@Req() req: Request, @Body('recieverId') recieverId: string) {
    return await this.homeService.createDm(req, recieverId);
  }

  @Post('recieverInfo')
  async fetchReciever(
    @Req() req: Request,
    @Body('conversation') conversation: string,
  ) {
    return await this.homeService.fetchReciever(req, conversation);
  }

  @Post('messages')
  async fetchMessages(
    @Req() req: Request,
    @Body('conversation') conversation: string,
    @Body('cursor') cursor?: string,
  ) {
    return await this.homeService.fetchMessages(req, conversation, cursor);
  }

  @Post('messages/send')
  async sendMessage(
    @Req() req: Request,
    @Body('message') message: string,
    @Body('conversation') conversation: string,
    @Body('replyTo') replyTo?: string,
  ) {
    return await this.homeService.sendMessage(
      req,
      message,
      conversation,
      replyTo,
    );
  }

  @Post('messages/edit')
  async editMessage(
    @Req() req: Request,
    @Body('message') message: string,
    @Body('messageId') messageId: string,
    @Body('conversation') conversation: string,
  ) {
    return await this.homeService.editMessage(
      req,
      message,
      messageId,
      conversation,
    );
  }

  @Post('messages/delete')
  async deleteMessage(
    @Req() req: Request,
    @Body('message') message: string,
    @Body('conversation') conversation: string,
  ) {
    return await this.homeService.deleteMessage(req, message, conversation);
  }

  @Post('senderInfo')
  async fetchSender(
    @Req() req: Request,
    @Body('sender') sender: string,
    @Body('replyTo') replyTo?: string,
  ) {
    return await this.homeService.fetchSender(req, sender, replyTo);
  }

  @Post('groups/create')
  async createGroup(
    @Req() req: Request,
    @Body('name') name: string,
    @Body('participants') participants: string[],
  ) {
    return await this.homeService.createGroup(req, name, participants);
  }

  @Post('groups/add')
  async groupAdd(
    @Req() req: Request,
    @Body('group') group: string,
    @Body('participants') participants: string[],
  ) {
    return await this.homeService.groupAdd(req, group, participants);
  }

  @Post('groups/kick')
  async groupKick(
    @Req() req: Request,
    @Body('group') group: string,
    @Body('participant') participant: string,
  ) {
    return await this.homeService.groupKick(req, group, participant);
  }

  @Post('groups/leave')
  async groupLeave(@Req() req: Request, @Body('group') group: string) {
    return await this.homeService.groupLeave(req, group);
  }

  @Post('groups/participants')
  async groupParticipants(@Req() req: Request, @Body('group') group: string) {
    return await this.homeService.groupParticipants(req, group);
  }
}
