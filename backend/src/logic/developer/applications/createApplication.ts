import { BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationsService } from 'src/services/applications.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';

dotenv.config();

export const createApplication = async (
  req: Request,
  name: string,
  description: string,
  usersService: UsersService,
  appService: ApplicationsService,
  messagesGateway: MessagesGateway,
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
    if (!name || name.length === 0) {
      throw new BadRequestException('Missing parameters');
    }
    if (name.length > 20) {
      throw new BadRequestException('Name must not exceed 20 characters');
    }
    if (description && description.length > 200) {
      throw new BadRequestException(
        'Description must not exceed 200 characters',
      );
    }

    const newId = uuidv4();

    await Promise.all([
      appService.createApplication(newId, user[0].id, name, description),
      usersService.appendApplication(newId, user[0].id),
    ]);

    messagesGateway.emitAppCreated(user[0].id);

    return {
      valid: true,
      message: 'Created Application.',
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in creating application.: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
