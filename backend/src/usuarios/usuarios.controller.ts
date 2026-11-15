import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FiltroAtividadeDTO } from '../estatisticas/dtos/filtro-atividade.dto.js';
import { FiltroEstatisticasDTO } from '../estatisticas/dtos/filtro-estatisticas.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PapeisGuard } from '../auth/guards/papeis.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';
import { ExcluirUsuarioDto } from './dtos/excluir-usuario.dto.js';
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

  @Delete(':id')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluir(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ExcluirUsuarioDto,
    @UsuarioAtual() administrador: UsuarioAutenticado,
  ) {
    return this.usuariosService.excluir(id, administrador.id, dto.senha);
  }

  @Get(':id/estatisticas/atividade')
  @Roles('administrador')
  obterAtividade(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() filtro: FiltroAtividadeDTO,
  ) {
    return this.usuariosService.obterAtividade(id, filtro);
  }

  @Get(':id/estatisticas')
  @Roles('administrador')
  obterEstatisticas(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() filtro: FiltroEstatisticasDTO,
  ) {
    return this.usuariosService.obterEstatisticas(id, filtro);
  }

  @Get(':id/baralhos')
  @Roles('administrador')
  listarBaralhos(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.usuariosService.listarBaralhos(id);
  }

  @Get(':id')
  @Roles('administrador')
  obterDetalhe(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usuariosService.obterDetalhe(id);
  }
}
