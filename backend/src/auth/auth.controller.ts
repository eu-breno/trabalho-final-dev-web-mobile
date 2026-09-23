import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './dtos/login.dto.js';
import { RegistroDTO } from './dtos/registro.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  async registro(@Body() dto: RegistroDTO) {
    return this.authService.registrar(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Get('me')
  async obterPerfil(@Req() req: string) {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.authService.obterPerfil(usuarioIdDummy);
  }
}
