import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { SignupService } from 'src/services/signup.service';
import { Request, Response } from 'express';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  async validateUser(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signupService.validateUser(
      username,
      email,
      password,
      res,
    );
  }

  @Post('otp')
  async signupOtp(
    @Body('otp') otp: string,
    @Body('email') email: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signupService.signupOtp(otp, email, res);
  }
  @Post('auth')
  async signupAuth(@Req() req: Request) {
    return await this.signupService.signupAuth(req);
  }
}
