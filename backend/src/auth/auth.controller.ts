import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistrarDto } from './dto/registrar.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  async registrar(@Body() dto: RegistrarDto) {
    return this.authService.registrar(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
