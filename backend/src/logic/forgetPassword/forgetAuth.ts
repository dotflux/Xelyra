import { BadRequestException } from '@nestjs/common';
import { DummyForgetService } from 'src/services/dummyForget.service';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const forgetAuth = async (
  dummyForgetService: DummyForgetService,
  usersService: UsersService,
  req: Request,
) => {
  try {
    const token = req.cookies?.forget_token;
    if (!token) {
      throw new BadRequestException('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      dummyId: string;
    };

    if (!decoded?.dummyId) {
      throw new BadRequestException('Invalid token');
    }

    const dummyForget = await dummyForgetService.findById(decoded?.dummyId);
    if (dummyForget.length === 0) {
      throw new BadRequestException('No such process in database');
    }

    const user = await usersService.findById(decoded?.dummyId);
    if (user.length === 0) {
      throw new BadRequestException('No such user in database');
    }

    return {
      valid: true,
      message: 'User in forget password process',
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.log('Error in authentication of forget password process: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
