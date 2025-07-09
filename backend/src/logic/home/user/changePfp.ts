import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import { UsersService } from 'src/services/users.service';
import { File as MulterFile } from 'multer';
import { MessagesGateway } from 'src/gateways/messages.gateway';

dotenv.config();

export const changePfp = async (
  req: Request,
  usersService: UsersService,
  messagesGateway: MessagesGateway,
  file?: MulterFile, // for manual/AI file upload
  aiImageUrl?: string, // for AI-generated image URL
  generatedImage?: { buffer: Buffer; ext: string }, // for AI-generated image buffer
) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) throw new UnauthorizedException('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    if (!decoded?.id) throw new UnauthorizedException('Invalid token');

    const user = await usersService.findById(decoded?.id);
    if (!user || user.length === 0)
      throw new UnauthorizedException('No such user in database');

    let pfpUrl = '';
    console.log(
      'file:',
      file,
      'aiImageUrl:',
      aiImageUrl,
      'generatedImage:',
      generatedImage,
    );

    // Manual or AI file upload
    if (file) {
      if (!file.mimetype.startsWith('image/'))
        throw new BadRequestException('Invalid file type');
      pfpUrl = `/uploads/${file.filename}`;
    }
    // AI-generated image buffer
    else if (generatedImage) {
      const { buffer, ext } = generatedImage;
      if (!buffer) {
        throw new BadRequestException(
          'No image buffer provided for AI-generated image',
        );
      }
      const filename = `pfp_${user[0].id}_${Date.now()}.${ext}`;
      const fs = require('fs');
      const path = require('path');
      // Always resolve to the real backend/uploads directory
      const uploadPath = path.join(process.cwd(), 'uploads', filename);
      console.log(
        '[changePfp] Writing AI-generated image to:',
        uploadPath,
        'Buffer size:',
        buffer.length,
      );
      fs.writeFileSync(uploadPath, buffer);
      console.log('[changePfp] File written successfully:', uploadPath);
      pfpUrl = `/uploads/${filename}`;
    }
    // AI-generated image URL
    else if (aiImageUrl) {
      pfpUrl = aiImageUrl;
    } else {
      throw new BadRequestException('No file, image URL, or buffer provided');
    }

    await usersService.updatePfp(user[0].id, pfpUrl);
    console.log('[changePfp] Updated user pfp in DB to:', pfpUrl);

    messagesGateway.emitUserUpdate(user[0].id, {
      pfp: pfpUrl,
    });

    return {
      valid: true,
      message: 'Pfp changed.',
      pfp: pfpUrl,
    };
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    )
      throw error;
    console.log('Error in changing pfp: ', error);
    throw new BadRequestException({
      valid: false,
      error: 'Internal Server Error',
    });
  }
};
