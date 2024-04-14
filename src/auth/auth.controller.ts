import { SignUpUserDto } from '@@/users/dto/create-user.dto';
import { CoreUserService } from '@@/users/user.service';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RealIp } from 'nestjs-real-ip';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: CoreUserService,
  ) {}

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
    @RealIp() clientIp: string,
  ) {
    return this.authService.signIn(signInDto, clientIp, response);
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpUserDto) {
    await this.userService.setupUser(signUpDto);
  }
}
