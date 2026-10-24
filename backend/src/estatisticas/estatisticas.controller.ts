import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EstatisticasService } from './estatisticas.service.js';
import { FiltroEstatisticasDTO } from './dtos/filtro-estatisticas.dto.js';
import { FiltroAtividadeDTO } from './dtos/filtro-atividade.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';

@Controller('estatisticas')
@UseGuards(JwtAuthGuard)
export class EstatisticasController {
  constructor(private readonly estatisticasService: EstatisticasService) {}

  @Get()
  async obterGerais(
    @Query() filtro: FiltroEstatisticasDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.estatisticasService.obterGerais(usuario.id, filtro);
  }

  @Get('atividade')
  async obterAtividade(
    @Query() filtro: FiltroAtividadeDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.estatisticasService.obterAtividade(usuario.id, filtro.dias);
  }

  @Get('baralhos/:baralhoId')
  async obterPorBaralho(
    @Param('baralhoId') baralhoId: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.estatisticasService.obterPorBaralho(baralhoId, usuario.id);
  }
}
