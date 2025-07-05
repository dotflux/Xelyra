import { Injectable } from '@nestjs/common';
import { DummyUsersService } from './dummyUsers.service';
import { validateUser } from 'src/logic/signup/validateUser';
import { signupOtp } from 'src/logic/signup/signupOtp';
import { signupAuth } from 'src/logic/signup/signupAuth';
import { UsersService } from './users.service';
import { Request, Response } from 'express';

@Injectable()
export class SignupService {
  constructor(
    private readonly dummyUsersService: DummyUsersService,
    private readonly usersService: UsersService,
  ) {}
  async validateUser(
    username: string,
    email: string,
    password: string,
    res: Response,
  ) {
    return await validateUser(
      username,
      email,
      password,
      this.dummyUsersService,
      this.usersService,
      res,
    );
  }

  async signupOtp(otp: string, email: string, res: Response) {
    return await signupOtp(
      otp,
      email,
      res,
      this.dummyUsersService,
      this.usersService,
    );
  }
  async signupAuth(req: Request) {
    return await signupAuth(req, this.dummyUsersService);
  }
}
