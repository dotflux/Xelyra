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

export const changePassword = async (
  req: Request,
  newPassword: string,
  currentPassword: string,
  confirmPassword: string,
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
    const match = await bcrypt.compare(currentPassword, user[0].password);
    if (!match) {
      throw new BadRequestException('Incorrect Password');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    if (newPassword.length < 8 || newPassword.length > 12) {
      throw new BadRequestException(
        'Password must be between 8 and 12 characters',
      );
    }
    const samePass = await bcrypt.compare(newPassword, user[0].password);
    if (samePass) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersService.updatePassword(user[0].id, hashedPassword);

    return {
      valid: true,
      message: 'Password changed.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in changing password: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
