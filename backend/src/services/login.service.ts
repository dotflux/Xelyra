import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { loginAuth } from 'src/logic/login/loginAuth';
import { loginUser } from 'src/logic/login/loginUser';
import { DummyForgetService } from './dummyForget.service';
import { validateForgetData } from 'src/logic/forgetPassword/validateForgetData';
import { forgetOtp } from 'src/logic/forgetPassword/forgetOtp';
import { forgetAuth } from 'src/logic/forgetPassword/forgetAuth';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dummyForgetService: DummyForgetService,
  ) {}
  async loginUser(email: string, password: string, res: Response) {
    return await loginUser(email, password, this.usersService, res);
  }

  async loginAuth(req: Request) {
    return await loginAuth(req, this.usersService);
  }

  async validateForgetData(email: string, newPassword: string, res: Response) {
    return await validateForgetData(
      email,
      newPassword,
      this.dummyForgetService,
      this.usersService,
      res,
    );
  }

  async forgetOtp(otp: string, req: Request, res: Response) {
    return await forgetOtp(
      otp,
      this.dummyForgetService,
      this.usersService,
      res,
      req,
    );
  }

  async forgetAuth(req: Request) {
    return await forgetAuth(this.dummyForgetService, this.usersService, req);
  }
}
