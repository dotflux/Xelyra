import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { GenAIService } from '../services/genai.service';
import { UsersService } from '../services/users.service';
import { fetchReciever } from '../logic/home/user/changeDisplayName';
import { Request } from 'express';
import { MessagesService } from 'src/services/messages.service';
import { v4 as uuidv4 } from 'uuid';
import { ConversationsService } from 'src/services/conversations.service';
import { GroupsService } from 'src/services/groups.service';
import { ChannelsService } from 'src/services/channels.service';
import * as dotenv from 'dotenv';
import { changePfp } from '../logic/home/user/changePfp';
import { GenAIImageService } from '../services/genaiImage.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
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
    if (
      conversation.length === 0 &&
      group.length === 0 &&
      channel.length === 0
    ) {
      throw new BadRequestException('Conversation not found');
    }
    console.log(replyTo);

    // Handle CHANGE_DISPLAYNAME command anywhere in the response
    if (response.includes('CHANGE_DISPLAYNAME:')) {
      console.log('changing display name called');
      const match = response.match(/CHANGE_DISPLAYNAME:.*$/m);
      if (match) {
        const newName = match[0].replace('CHANGE_DISPLAYNAME:', '').trim();
        const result = await fetchReciever(req, newName, this.usersService);
        response = 'Display name changed to ' + newName;
      }
    }
    // Handle CHANGE_PFP command anywhere in the response
    if (response.includes('CHANGE_PFP:')) {
      console.log('changing pfp called');
      const match = response.match(/CHANGE_PFP:.*$/m);
      if (match) {
        const pfpValue = match[0].replace('CHANGE_PFP:', '').trim();
        if (pfpValue.startsWith('GENERATE_IMAGE:')) {
          console.log('generating image');
          const prompt = pfpValue.replace('GENERATE_IMAGE:', '').trim();
          try {
            console.log('[GenAI] Generating AI image for prompt:', prompt);
            const generatedImage =
              await this.genaiImageService.generateImage(prompt);
            console.log(
              '[GenAI] AI image generated, buffer size:',
              generatedImage?.buffer?.length,
              'ext:',
              generatedImage?.ext,
            );
            const changeResult = await changePfp(
              req,
              this.usersService,
              undefined,
              undefined,
              generatedImage,
            );
            console.log('[GenAI] changePfp result:', changeResult);
            response = 'Profile picture changed (AI-generated).';
          } catch (err) {
            console.error(
              '[GenAI] Error generating AI image or changing pfp:',
              err,
            );
            response = 'Failed to generate profile picture.';
          }
        } else if (pfpValue === 'USE_LAST_IMAGE') {
          console.log('using last image');
          if (Array.isArray(files) && files.length > 0) {
            const imageFile =
              files.find((f) => f.type && f.type.startsWith('image/')) ||
              files[0];
            if (imageFile && imageFile.url) {
              await changePfp(req, this.usersService, undefined, imageFile.url);
              response = 'Profile picture changed to your last uploaded image.';
            } else {
              response = 'No valid image file found in the files array.';
            }
          } else {
            response = 'No image file found in the files array.';
          }
        } else if (/^https?:\/\//.test(pfpValue)) {
          await changePfp(req, this.usersService, undefined, pfpValue);
          response = 'Profile picture changed.';
        } else {
          response = 'Invalid image URL or command for profile picture.';
        }
      }
    }
    console.log('sending message');
    const newId = uuidv4();
    const saved = await this.messagesService.createMessage(
      newId,
      response,
      process.env.AI_ID as string,
      conversationId,
      false,
      false,
      replyTo,
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
