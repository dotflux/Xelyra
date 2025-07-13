import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { File as MulterFile } from 'multer';
dotenv.config();

export const changeBannerTheme = async (
  req: Request,
  usersService: UsersService,
  messagesGateway: MessagesGateway,
  file?: MulterFile,
  primary_theme?: string,
  secondary_theme?: string,
) => {
  const token = req.cookies?.user_token;
  if (!token) throw new UnauthorizedException('No token provided');
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    id: string;
  };
  if (!decoded?.id) throw new UnauthorizedException('Invalid token');
  const user = await usersService.findById(decoded?.id);
  if (!user || user.length === 0)
    throw new UnauthorizedException('No such user in database');
  let bannerUrl: string | null = null;
  if (file) {
    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('Invalid file type');
    if (file.size > 5 * 1024 * 1024)
      throw new BadRequestException('File too large');
    bannerUrl = `/uploads/${file.filename}`;
  } else if (req.body.removeBanner) {
    bannerUrl = null;
  } else {
    bannerUrl = user[0].banner || null;
  }
  if (primary_theme && !/^#[0-9A-Fa-f]{6}$/.test(primary_theme))
    throw new BadRequestException('Invalid primary color');
  if (secondary_theme && !/^#[0-9A-Fa-f]{6}$/.test(secondary_theme))
    throw new BadRequestException('Invalid secondary color');
  await usersService.updateBannerTheme(
    user[0].id,
    bannerUrl,
    primary_theme,
    secondary_theme,
  );
  messagesGateway.emitUserUpdate(user[0].id, {
    banner: bannerUrl,
    primary_theme,
    secondary_theme,
  });
  return {
    valid: true,
    message: 'Banner/theme updated.',
    banner: bannerUrl,
    primary_theme,
    secondary_theme,
  };
};
