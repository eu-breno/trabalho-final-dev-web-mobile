import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistrarDto } from './dto/registrar.dto.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';
import { UpdateSenhaDto } from './dto/update-senha.dto.js';
import { UsuarioAtual } from './decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from './tipos/usuario-autenticado.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('perfil')
  async perfil(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.authService.encontrarPorId(usuario.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('perfil')
  async atualizarPerfil(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.authService.atualizarPerfil(usuario.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('senha')
  async atualizarSenha(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: UpdateSenhaDto,
  ) {
    return this.authService.atualizarSenha(usuario.id, dto);
  }
}
