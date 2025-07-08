import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import * as fs from 'fs';
import * as path from 'path';
import { File as MulterFile } from 'multer';
import { ServersService } from 'src/services/servers.service';
dotenv.config();

export const updateServerPfp = async (
  req: Request,
  serverId: string,
  file: MulterFile,
  usersService: UsersService,
  serversService: ServersService,
) => {
  const token = req.cookies?.user_token;
  if (!token) throw new UnauthorizedException('No token provided');
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    id: string;
  };
  if (!decoded?.id) throw new UnauthorizedException('Invalid token');
  const user = await usersService.findById(decoded?.id);
  if (user.length === 0)
    throw new UnauthorizedException('No such user in database');
  const server = await serversService.findById(serverId);
  if (!server || server.length === 0)
    throw new BadRequestException('No such server');
  if (server[0].owner.toString() !== user[0].id.toString())
    throw new BadRequestException('Not your server');
  if (!file) throw new BadRequestException('No file uploaded');
  if (!file.mimetype.startsWith('image/'))
    throw new BadRequestException('Invalid file type');
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  const ext = path.extname(file.originalname) || '.png';
  const filename = `server_pfp_${serverId}_${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  const fileUrl = `/uploads/${filename}`;
  await serversService.updateServerInfo(serverId, { pfp: fileUrl });
  return {
    valid: true,
    message: 'Server pfp updated.',
    pfp: fileUrl,
  };
};
