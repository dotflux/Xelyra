import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { GroupsService } from 'src/services/groups.service';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const changeGroupName = async (
  req: Request,
  groupsService: GroupsService,
  groupId: string,
  newName: string,
  usersService: UsersService,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) throw new UnauthorizedException('No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!decoded?.id) throw new UnauthorizedException('Invalid token');
    const user = await usersService.findById(decoded.id);
    if (user.length === 0) throw new UnauthorizedException('No such user');

    // Check group exists and user is a participant
    const group = await groupsService.findById(groupId);
    if (!group.length) throw new BadRequestException('No such group');
    if (
      !group[0].participants
        .map((m) => m.toString())
        .includes(user[0].id.toString())
    )
      throw new UnauthorizedException('Not a group participant');

    await groupsService.updateName(groupId, newName);
    return {
      valid: true,
      message: 'Group name changed.',
      name: newName,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    )
      throw error;
    console.log('Error in changing group name: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
