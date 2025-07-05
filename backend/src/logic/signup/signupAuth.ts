import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { DummyUsersService } from 'src/services/dummyUsers.service';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

export const signupAuth = async (
  req: Request,
  dummyUsersService: DummyUsersService,
) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      dummyMail: string;
    };

    if (!decoded?.dummyMail) {
      throw new UnauthorizedException('Invalid token');
    }

    const dummyUser = await dummyUsersService.findByEmail(decoded?.dummyMail);
    if (dummyUser.length === 0) {
      throw new UnauthorizedException('No such user in process');
    }
    return {
      valid: true,
      userEmail: decoded.dummyMail,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in signup token auth: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
