import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const acceptRequest = async (
  req: Request,
  recieverId: string,
  usersService: UsersService,
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
    const reciever = await usersService.findById(recieverId);
    if (reciever.length === 0) {
      throw new BadRequestException('No such user in database');
    }

    const alreadyFriends = await usersService.alreadyFriends(
      user[0].id,
      recieverId,
    );
    if (alreadyFriends) {
      throw new BadRequestException('Already friends');
    }
    const request = await usersService.findRequest(recieverId, user[0].id);
    if (request.length === 0) {
      throw new BadRequestException('No such request in database');
    }
    await Promise.all([
      usersService.addFriend(user[0].id, recieverId),
      usersService.addFriend(recieverId, user[0].id),
      usersService.removeRequest(recieverId, user[0].id),
      usersService.removeRequestSent(recieverId, user[0].id),
    ]);

    return {
      valid: true,
      message: 'Request Accepted.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in fetching reciever info: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
