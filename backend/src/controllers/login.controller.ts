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
}
