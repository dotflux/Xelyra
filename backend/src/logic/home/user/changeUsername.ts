import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';

dotenv.config();

export const changeUsername = async (
  req: Request,
  newUsername: string,
  password: string,
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
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      throw new BadRequestException('Incorrect Password');
    }
    if (newUsername.length < 5 || newUsername.length > 10) {
      throw new BadRequestException(
        'Username must be between 3 and 20 characters',
      );
    }
    if (!validator.isAlphanumeric(newUsername)) {
      throw new BadRequestException('Username must be alphanumeric');
    }
    const existingUsername = await usersService.findByUsername(newUsername);
    if (existingUsername.length > 0) {
      throw new BadRequestException('Username already exists');
    }

    await usersService.updateUsername(user[0].id, newUsername);
    messagesGateway.emitUserUpdate(user[0].id, {
      username: newUsername,
    });

    return {
      valid: true,
      message: 'Username changed.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in changing username: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
