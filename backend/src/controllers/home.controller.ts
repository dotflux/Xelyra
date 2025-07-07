import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HomeService } from 'src/services/home.service';
import { Request, Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';

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
    const { changePfp } = await import('src/logic/home/user/changePfp');
    const file =
      uploadedFiles?.pfp && uploadedFiles.pfp.length > 0
        ? uploadedFiles.pfp[0]
        : undefined;
    return await changePfp(
      req,
      this.homeService['usersService'],
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
}
