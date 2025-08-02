import { BadRequestException } from '@nestjs/common';
import { DummyForgetService } from 'src/services/dummyForget.service';
import * as validator from 'validator';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const forgetOtp = async (
  otp: string,
  dummyForgetService: DummyForgetService,
  usersService: UsersService,
  res: Response,
  req: Request,
) => {
  try {
    if (!otp) {
      throw new BadRequestException('Invalid or missing parameters');
    }

    if (validator.isEmpty(otp)) {
      throw new BadRequestException('Invalid email format');
    }

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
    if (dummyForget[0].otp !== otp) {
      throw new BadRequestException('Invalid otp');
    }

    const user = await usersService.findById(decoded?.dummyId);
    if (user.length === 0) {
      throw new BadRequestException('No such user in database');
    }

    await usersService.updatePassword(
      dummyForget[0].id,
      dummyForget[0].new_password,
    );
    await dummyForgetService.deleteById(decoded?.dummyId);
    res.clearCookie('forget_token');

    return {
      valid: true,
      message: 'User forget password completed successfully',
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.log('Error in forget password completion: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
