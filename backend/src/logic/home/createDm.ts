import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesService } from 'src/services/messages.service';
import { ConversationsService } from 'src/services/conversations.service';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const createDm = async (
  req: Request,
  recieverId: string,
  usersService: UsersService,
  messagesService: MessagesService,
  conversationsService: ConversationsService,
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
    if (!recieverId) {
      throw new BadRequestException('Missing parameters');
    }
    const reciever = await usersService.findById(recieverId);
    if (reciever.length === 0) {
      throw new BadRequestException('No such user in database');
    }
    const dmId = [user[0].id, reciever[0].id].sort().join('_');

    const existing = await conversationsService.findDmId(dmId);
    if (existing.length > 0) {
      return {
        valid: true,
        message: 'Dm already exists',
        conversationId: existing[0].id,
      };
    }
    const newId = uuidv4();
    await conversationsService.createConversation(
      newId,
      dmId,
      [user[0].id, reciever[0].id],
      'dm',
    );

    await usersService.appendConversation(newId, user[0].id);
    await usersService.appendConversation(newId, reciever[0].id);

    return {
      valid: true,
      message: 'Created Dm',
      newId,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating dm: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
