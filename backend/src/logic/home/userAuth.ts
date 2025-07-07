import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export interface UserData {
  id: string;
  username: string;
  servers: string[];
  friends: string[];
  conversations: string[];
  pfp: string;
  displayName: string;
  xyn_id: string;
}

export const userAuth = async (req: Request, usersService: UsersService) => {
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
    const userData: UserData = {
      id: user[0].id,
      username: user[0].username,
      servers: user[0].servers,
      friends: user[0].servers,
      conversations: user[0].conversations,
      pfp: user[0].pfp,
      displayName: user[0].display_name,
      xyn_id: user[0].xyn_id,
    };
    return {
      valid: true,
      message: 'User is logged',
      userData,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in home token auth: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
