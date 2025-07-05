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
}
