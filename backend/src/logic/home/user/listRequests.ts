import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export interface RequestInfo {
  id: string;
  username: string;
  pfp: string;
}

export const listRequests = async (
  req: Request,
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

    // Fetch requests from new requests table using a public service method
    const senderIds = await usersService.getRequestsByRecieverId(user[0].id);
    if (!senderIds || senderIds.length === 0) {
      return {
        valid: true,
        message: 'Requests Listed',
        requests: [],
      };
    }
    const requestsInfo: RequestInfo[] = [];
    for (const senderId of senderIds) {
      const friend = await usersService.findById(senderId);
      if (friend.length === 0) continue;
      requestsInfo.push({
        id: friend[0].id,
        username: friend[0].username,
        pfp: friend[0].pfp,
      });
    }
    return {
      valid: true,
      message: 'Requests Listed',
      requests: requestsInfo,
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
