import { BadRequestException } from '@nestjs/common';
import { DummyUsersService } from 'src/services/dummyUsers.service';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const signupOtp = async (
  otp: string,
  email: string,
  res: Response,
  dummyUsersService: DummyUsersService,
  usersService: UsersService,
) => {
  try {
    if (!otp || !email) {
      throw new BadRequestException('Invalid or missing parameters');
    }

    const existingEmail = await usersService.findByEmail(email);
    if (existingEmail.length > 0) {
      throw new BadRequestException('Email in use.');
    }
    const inRegistration = await dummyUsersService.findByEmail(email);
    if (inRegistration.length === 0) {
      throw new BadRequestException('This email is not under registration.');
    }

    if (otp !== inRegistration[0].otp) {
      throw new BadRequestException('Incorrect otp');
    }
    if (otp === inRegistration[0].otp) {
      await dummyUsersService.deleteById(inRegistration[0].id);
      await usersService.createUser(
        inRegistration[0].id,
        inRegistration[0].username,
        inRegistration[0].email,
        inRegistration[0].password,
      );
      res.clearCookie('auth_token');
      return { valid: true, message: 'User registered successfully' };
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.log('Error in signup initial validation: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
