import { Controller, Post, Req} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  userLogin(@Req() req: Request) {
    try {
      return this.authService.login(req.body.username, req.body.password)
    } catch (err) {
      console.log('Login Error ',err);
      throw new err;
    }
  }
}
