import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PapeisGuard } from '../auth/guards/papeis.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ListarUsuariosDto } from './dtos/listar-usuarios.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PapeisGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles('administrador')
  listar(@Query() query: ListarUsuariosDto) {
    return this.usuariosService.listar(query);
  }
}
