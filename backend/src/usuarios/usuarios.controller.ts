import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UpdateUsuarioDTO } from './dtos/update-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('me')
  async obterPerfilAtual() {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.usuariosService.buscarPorId(usuarioIdDummy);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  @Patch('me')
  async atualizarPerfil(@Body() dto: UpdateUsuarioDTO) {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.usuariosService.atualizar(usuarioIdDummy, dto);
  }
}
