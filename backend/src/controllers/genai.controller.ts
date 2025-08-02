import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { GenAIService } from '../services/genai.service';
import { UsersService } from '../services/users.service';
import { Request } from 'express';
import { MessagesService } from 'src/services/messages.service';
import { v4 as uuidv4 } from 'uuid';
import { ConversationsService } from 'src/services/conversations.service';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';
import * as dotenv from 'dotenv';
import { GenAIImageService } from '../services/genaiImage.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { handleDisplayNameChange } from 'src/logic/genai/handleDisplayNameChange';
import { handlePfpChange } from 'src/logic/genai/handlePfpChange';
import { handleBannerChange } from 'src/logic/genai/handleBannerChange';
import { handleThemeChange } from 'src/logic/genai/handleThemeChange';
import { handleImageGeneration } from 'src/logic/genai/handleImageGeneration';
import { handleBannerFallback } from 'src/logic/genai/handleBannerFallback';
dotenv.config();

@Controller('api/genai')
export class GenAiController {
  constructor(
    private readonly genaiService: GenAIService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly groupsService: GroupsService,
    private readonly channelsService: ChannelsService,
    private readonly genaiImageService: GenAIImageService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Post('message')
  async handleMessage(
    @Body('message') message: string,
    @Req() req: Request,
    @Body('conversation') conversationId: string,
    @Body('replyTo') replyTo: string,
    @Body('files') files: any[],
  ) {
    let response = await this.genaiService.sendMessage(message);
    const conversation =
      await this.conversationsService.findById(conversationId);
    const group = await this.groupsService.findById(conversationId);
    const channel = await this.channelsService.findById(conversationId);
    if (conversation.length === 0 && group.length === 0 && channel.length === 0)
      throw new BadRequestException('Conversation not found');
    if (
      await handleBannerFallback({
        message,
        response,
        req,
        usersService: this.usersService,
        messagesGateway: this.messagesGateway,
        genaiImageService: this.genaiImageService,
        messagesService: this.messagesService,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    if (
      await handleDisplayNameChange({
        response,
        req,
        usersService: this.usersService,
        messagesGateway: this.messagesGateway,
        messagesService: this.messagesService,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    if (
      await handlePfpChange({
        response,
        req,
        usersService: this.usersService,
        messagesGateway: this.messagesGateway,
        genaiImageService: this.genaiImageService,
        messagesService: this.messagesService,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    if (
      await handleBannerChange({
        response,
        req,
        usersService: this.usersService,
        messagesGateway: this.messagesGateway,
        genaiImageService: this.genaiImageService,
        messagesService: this.messagesService,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    if (
      await handleThemeChange({
        response,
        req,
        usersService: this.usersService,
        messagesGateway: this.messagesGateway,
        messagesService: this.messagesService,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    if (
      await handleImageGeneration({
        response,
        message,
        req,
        genaiImageService: this.genaiImageService,
        messagesService: this.messagesService,
        messagesGateway: this.messagesGateway,
        conversationId,
        replyTo,
        files,
      })
    )
      return { response };
    const newId = uuidv4();
    const saved = await this.messagesService.createMessage(
      newId,
      response,
      process.env.AI_ID as string,
      conversationId,
      false,
      false,
      replyTo,
      files,
    );
    this.messagesGateway.sendToConversation(conversationId, {
      conversation: conversationId,
      message: response,
      user: process.env.AI_ID as string,
      created_at: saved.created_at,
      created_timestamp: saved.created_timestamp,
      id: newId,
      reply_to: replyTo,
      files: files || [],
    });
    return { response };
  }
}
