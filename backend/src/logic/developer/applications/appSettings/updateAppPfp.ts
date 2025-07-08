import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { ApplicationsService } from 'src/services/applications.service';
import * as fs from 'fs';
import * as path from 'path';
import { File as MulterFile } from 'multer';
dotenv.config();

export const updateAppPfp = async (
  req: Request,
  id: string,
  file: MulterFile,
  usersService: UsersService,
  appService: ApplicationsService,
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
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
    const app = await appService.findById(id);
    if (app.length === 0) {
      throw new BadRequestException('No such app');
    }
    if (app[0].owner_id.toString() !== user[0].id.toString()) {
      throw new BadRequestException('Not your app');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Save file to /uploads (absolute path)
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const ext = path.extname(file.originalname) || '.png';
    const filename = `app_pfp_${id}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    const fileUrl = `/uploads/${filename}`;
    await appService.updatePfp(id, fileUrl);
    return {
      valid: true,
      message: 'App pfp updated.',
      pfp: fileUrl,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    console.log('Error in updating app pfp: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
