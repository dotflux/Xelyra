import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { LoginService } from 'src/services/login.service';
import { Request, Response } from 'express';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async validateUser(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.loginService.loginUser(email, password, res);
  }
  @Post('auth')
  async loginAuth(@Req() req: Request) {
    return await this.loginService.loginAuth(req);
  }

  @Post('forget/auth')
  async forgetAuth(@Req() req: Request) {
    return await this.loginService.forgetAuth(req);
  }

  @Post('forget/validate')
  async validateForgetData(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.loginService.validateForgetData(email, newPassword, res);
  }

  @Post('forget/otp')
  async forgetOtp(
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.loginService.forgetOtp(otp, req, res);
  }
}
