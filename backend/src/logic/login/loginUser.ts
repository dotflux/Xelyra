import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as validator from 'validator';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Response } from 'express';
import { UsersService } from 'src/services/users.service';
dotenv.config();

export const loginUser = async (
  email: string,
  password: string,
  usersService: UsersService,
  res: Response,
) => {
  try {
    if (!email || !password) {
      throw new BadRequestException('Invalid or missing parameters');
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingEmail = await usersService.findByEmail(email);
    if (existingEmail.length === 0) {
      throw new BadRequestException('Email not registered');
    }

    const match = await bcrypt.compare(password, existingEmail[0].password);
    if (!match) {
      throw new BadRequestException('Incorrect Password');
    }

    const token = jwt.sign(
      { id: existingEmail[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    );

    res.cookie('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 5 minutes
    });

    return { valid: true, message: 'User logged in successfully' };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.log('Error in login: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
