import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';

dotenv.config();

export const changeBio = async (
  req: Request,
  newBio: string,
  usersService: UsersService,
  messagesGateway: MessagesGateway,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

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
    if (newBio.length > 500) {
      throw new BadRequestException('Bio must be less than 500 characters');
    }

    await usersService.updateBio(user[0].id, newBio);
    messagesGateway.emitUserUpdate(user[0].id, {
      bio: newBio,
    });

    return {
      valid: true,
      message: 'Bio changed.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in changing bio: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
