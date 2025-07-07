import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { GroupsService } from 'src/services/groups.service';
import { File as MulterFile } from 'multer';
import { UsersService } from 'src/services/users.service';

dotenv.config();

export const changeGroupPfp = async (
  req: Request,
  groupsService: GroupsService,
  groupId: string,
  usersService: UsersService,
  file?: MulterFile, // for manual file upload
  imageUrl?: string, // for direct image URL
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
    if (group.length === 0) throw new BadRequestException('No such group');
    if (
      !group[0].participants
        .map((m) => m.toString())
        .includes(user[0].id.toString())
    )
      throw new UnauthorizedException('Not a group participant');

    let pfpUrl = '';
    if (file) {
      if (!file.mimetype.startsWith('image/'))
        throw new BadRequestException('Invalid file type');
      pfpUrl = `/uploads/${file.filename}`;
    } else if (imageUrl) {
      pfpUrl = imageUrl;
    } else {
      throw new BadRequestException('No file or image URL provided');
    }

    await groupsService.updatePfp(groupId, pfpUrl);
    return {
      valid: true,
      message: 'Group pfp changed.',
      pfp: pfpUrl,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    )
      throw error;
    console.log('Error in changing group pfp: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
