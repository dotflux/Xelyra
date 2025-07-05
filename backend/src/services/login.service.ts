import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { loginAuth } from 'src/logic/login/loginAuth';
import { loginUser } from 'src/logic/login/loginUser';

@Injectable()
export class LoginService {
  constructor(private readonly usersService: UsersService) {}
  async loginUser(email: string, password: string, res: Response) {
    return await loginUser(email, password, this.usersService, res);
  }

  async loginAuth(req: Request) {
    return await loginAuth(req, this.usersService);
  }
}
