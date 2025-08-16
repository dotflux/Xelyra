import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import { HomeService } from 'src/services/home.service';
import { Request, Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { changePfp } from 'src/logic/home/user/changePfp';
import { changeBannerTheme } from '../logic/home/user/changeBannerTheme';
import axios from 'axios';

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
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      storage: diskStorage({
        destination: resolve(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async sendMessage(
    @Req() req: Request,
    @Body('message') message: string,
    @Body('conversation') conversation: string,
    @Body('replyTo') replyTo?: string,
    @UploadedFiles() uploadedFiles?: { files?: Multer.File[] },
  ) {
    let filesMeta: any[] = [];
    if (uploadedFiles?.files && uploadedFiles.files.length > 0) {
      filesMeta = uploadedFiles.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype,
        size: file.size,
      }));
    }
    return await this.homeService.sendMessage(
      req,
      message,
      conversation,
      replyTo,
      filesMeta,
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

  @Post('groups/fetch/info')
  async fetchGroupInfo(@Req() req: Request, @Body('group') groupId: string) {
    return await this.homeService.fetchGroupInfo(req, groupId);
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

  @Post('servers/create')
  async createServer(@Req() req: Request, @Body('name') name: string) {
    return await this.homeService.createServer(req, name);
  }

  @Post('pfp')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'pfp', maxCount: 1 }], {
      storage: diskStorage({
        destination: resolve(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async changePfp(
    @Req() req: Request,
    @UploadedFiles() uploadedFiles?: { pfp?: Multer.File[] },
    @Body('aiImageUrl') aiImageUrl?: string,
  ) {
    console.log('uploadedFiles:', uploadedFiles);
    const file =
      uploadedFiles?.pfp && uploadedFiles.pfp.length > 0
        ? uploadedFiles.pfp[0]
        : undefined;
    return await changePfp(
      req,
      this.homeService['usersService'],
      this.homeService['messagesGateway'],
      file,
      aiImageUrl,
    );
  }

  @Post('groups/pfp')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'pfp', maxCount: 1 }], {
      storage: diskStorage({
        destination: resolve(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async changeGroupPfp(
    @Req() req: Request,
    @Body('groupId') groupId: string,
    @UploadedFiles() uploadedFiles?: { pfp?: Multer.File[] },
    @Body('imageUrl') imageUrl?: string,
  ) {
    const file =
      uploadedFiles?.pfp && uploadedFiles.pfp.length > 0
        ? uploadedFiles.pfp[0]
        : undefined;
    return await this.homeService.changeGroupPfp(req, groupId, file, imageUrl);
  }

  @Post('groups/name')
  async changeGroupName(
    @Req() req: Request,
    @Body('groupId') groupId: string,
    @Body('name') name: string,
  ) {
    return await this.homeService.changeGroupName(req, groupId, name);
  }
  @Post('requests')
  async fetchRequests(@Req() req: Request) {
    return await this.homeService.fetchRequests(req);
  }
  @Post('requests/send')
  async sendRequest(
    @Req() req: Request,
    @Body('recieverName') recieverId: string,
  ) {
    return await this.homeService.sendRequest(req, recieverId);
  }
  @Post('requests/accept')
  async acceptRequest(
    @Req() req: Request,
    @Body('recieverId') recieverId: string,
  ) {
    return await this.homeService.acceptRequest(req, recieverId);
  }
  @Post('requests/reject')
  async rejectRequest(
    @Req() req: Request,
    @Body('recieverId') recieverId: string,
  ) {
    return await this.homeService.rejectRequest(req, recieverId);
  }
  @Post('requests/cancel')
  async cancelRequest(
    @Req() req: Request,
    @Body('recieverId') recieverId: string,
  ) {
    return await this.homeService.cancelRequest(req, recieverId);
  }
  @Post('requests/sent')
  async listSentRequests(@Req() req: Request) {
    return await this.homeService.listSentRequests(req);
  }
  @Post('popupInfo')
  async fetchPopupInfo(
    @Req() req: Request,
    @Body('userToFetch') userToFetch: string,
  ) {
    return await this.homeService.fetchPopupInfo(req, userToFetch);
  }

  @Post('user/changeDisplayName')
  async changeDisplayName(
    @Req() req: Request,
    @Body('displayName') displayName: string,
  ) {
    return await this.homeService.changeDisplayName(req, displayName);
  }

  @Post('user/changeBio')
  async changeBio(@Req() req: Request, @Body('bio') bio: string) {
    return await this.homeService.changeBio(req, bio);
  }

  @Post('user/changeUsername')
  async changeUsername(
    @Req() req: Request,
    @Body('newUsername') username: string,
    @Body('password') password: string,
  ) {
    return await this.homeService.changeUsername(req, username, password);
  }

  @Post('user/changePassword')
  async changePassword(
    @Req() req: Request,
    @Body('newPassword') password: string,
    @Body('currentPassword') currentPassword: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    return await this.homeService.changePassword(
      req,
      password,
      currentPassword,
      confirmPassword,
    );
  }

  @Post('user/changeBannerTheme')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'banner', maxCount: 1 }], {
      storage: diskStorage({
        destination: resolve(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async changeBannerTheme(
    @Req() req: Request,
    @UploadedFiles() uploadedFiles?: { banner?: Multer.File[] },
    @Body('primary_theme') primary_theme?: string,
    @Body('secondary_theme') secondary_theme?: string,
  ) {
    const file =
      uploadedFiles?.banner && uploadedFiles.banner.length > 0
        ? uploadedFiles.banner[0]
        : undefined;
    return await changeBannerTheme(
      req,
      this.homeService['usersService'],
      this.homeService['messagesGateway'],
      file,
      primary_theme,
      secondary_theme,
    );
  }

  @Post('api/tenor/:id')
  async getGif(@Param('id') id: string) {
    const apiKey = process.env.TENOR_API;
    const url = `https://tenor.googleapis.com/v2/posts?ids=${id}&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  @Post('api/tenorsearch')
  async searchGif(@Body('query') query: string) {
    const apiKey = process.env.TENOR_API;
    const url = `https://tenor.googleapis.com/v2/search?q=${query}&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  @Post('api/tenortrending')
  async trendingGifs() {
    const apiKey = process.env.TENOR_API;
    const url = `https://tenor.googleapis.com/v2/featured?key=${apiKey}&limit=24`;
    const response = await axios.get(url);
    return response.data;
  }

  @Post('api/tenorcategories')
  async gifCategories() {
    const apiKey = process.env.TENOR_API;
    const url = `https://tenor.googleapis.com/v2/categories?key=${apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  @Post('servers/invites/fetch')
  async fetchInviteInfo(
    @Req() req: Request,
    @Body('inviteId') inviteId: string,
  ) {
    return await this.homeService.fetchInviteInfo(req, inviteId);
  }

  @Post('servers/permissionToAdd')
  async permissionToAdd(@Req() req: Request) {
    return await this.homeService.permissionToAdd(req);
  }

  @Post('conversation/participants')
  async conversationParticipants(
    @Req() req: Request,
    @Body('conversation') conversation: string,
  ) {
    return await this.homeService.conversationParticipants(req, conversation);
  }

  @Post('logout')
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.homeService.logOut(req, res);
  }
}
