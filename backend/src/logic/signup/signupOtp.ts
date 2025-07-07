import { BadRequestException } from '@nestjs/common';
import { DummyUsersService } from 'src/services/dummyUsers.service';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';
import { ConversationsService } from 'src/services/conversations.service';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const signupOtp = async (
  otp: string,
  email: string,
  res: Response,
  dummyUsersService: DummyUsersService,
  usersService: UsersService,
  conversationsService: ConversationsService,
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
      const newId = uuidv4();
      const dmId = [inRegistration[0].id, process.env.AI_ID as string]
        .sort()
        .join('_');
      res.clearCookie('auth_token');
      await Promise.all([
        conversationsService.createConversation(
          newId,
          dmId,
          [inRegistration[0].id, process.env.AI_ID as string],
          'dm',
        ),
        usersService.setXynId(newId, inRegistration[0].id),
      ]);
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
