import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DummyForgetService } from 'src/services/dummyForget.service';
import * as validator from 'validator';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';
import { generateOTP } from 'src/general_scripts/otpGenerator';
import sendEmail from 'src/general_scripts/mailer';

dotenv.config();

export const validateForgetData = async (
  email: string,
  newPassword: string,
  dummyForgetService: DummyForgetService,
  usersService: UsersService,
  res: Response,
) => {
  try {
    if (!email || !newPassword) {
      throw new BadRequestException('Invalid or missing parameters');
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const exists = await usersService.findByEmail(email);
    if (exists.length === 0) {
      throw new BadRequestException('Email not registered');
    }

    const otp: string = generateOTP();

    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(newPassword, saltRounds);

    const inRegistration = await dummyForgetService.findById(exists[0].id);
    if (inRegistration.length > 0) {
      throw new BadRequestException('This email is under the process already.');
    }

    const fields = [
      { field: 'password', value: newPassword, minLength: 8, maxLength: 12 },
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

    await dummyForgetService.createDummyForget(
      exists[0].id,
      email,
      hashedPassword,
      otp,
    );
    const token = jwt.sign(
      { dummyId: exists[0].id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: '5m',
      },
    );

    res.cookie('forget_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    await sendEmail(
      email,
      'Forget Password',
      `Your One Time Password (OTP) for forget password procedure in our app Xelyra is ${otp}`,
    );

    return {
      valid: true,
      message: 'User forget password validated successfully',
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.log('Error in forget password initial validation: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
