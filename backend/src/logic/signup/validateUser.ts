import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DummyUsersService } from 'src/services/dummyUsers.service';
import * as validator from 'validator';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';
import { generateOTP } from 'src/general_scripts/otpGenerator';
import sendEmail from 'src/general_scripts/mailer';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const validateUser = async (
  username: string,
  email: string,
  password: string,
  dummyUsersService: DummyUsersService,
  usersService: UsersService,
  res: Response,
) => {
  try {
    if (!username || !email || !password) {
      throw new BadRequestException('Invalid or missing parameters');
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!validator.isAlphanumeric(username)) {
      throw new BadRequestException('Username must be alphanumeric');
    }

    const otp: string = generateOTP();
    const id: string = uuidv4();
    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const existingEmail = await usersService.findByEmail(email);
    if (existingEmail.length > 0) {
      throw new BadRequestException('Email in use.');
    }
    const existingUsername = await usersService.findByUsername(username);
    if (existingUsername.length > 0) {
      throw new BadRequestException('Username is taken.');
    }
    const inRegistration = await dummyUsersService.findByEmail(email);
    if (inRegistration.length > 0) {
      throw new BadRequestException('This email is under registration.');
    }

    const fields = [
      { field: 'username', value: username, minLength: 5, maxLength: 10 },
      { field: 'password', value: password, minLength: 8, maxLength: 12 },
      { field: 'email', value: email },
    ];

    fields.forEach(({ field, value, maxLength, minLength }) => {
      if (validator.isEmpty(value)) {
        throw new BadRequestException(`${field} is required.`);
      } else if (
        minLength &&
        maxLength &&
        !validator.isLength(value, { min: minLength, max: maxLength })
      ) {
        throw new BadRequestException(
          `${field} max ${maxLength} min ${minLength}`,
        );
      }
    });

    await dummyUsersService.createDummyUser(
      id,
      username,
      email,
      hashedPassword,
      otp,
    );
    const token = jwt.sign({ dummyMail: email }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    await sendEmail(
      email,
      'One Time Password for Xelyra',
      `Your One Time Password (OTP) for signup procedure in our app Xelyra is ${otp}`,
    );

    return { valid: true, message: 'User validated successfully' };
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
