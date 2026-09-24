import { Controller, Get, Param, Query } from '@nestjs/common';
import { EstatisticasService } from './estatisticas.service.js';
import { FiltroEstatisticasDTO } from './dtos/filtro-estatisticas.dto.js';

@Controller('estatisticas')
export class EstatisticasController {
  constructor(private readonly estatisticasService: EstatisticasService) {}

  @Get()
  async obterGerais(@Query() filtro: FiltroEstatisticasDTO) {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.estatisticasService.obterGerais(usuarioIdDummy, filtro);
  }

  // GET /estatisticas/baralhos/:baralhoId -> Métricas específicas de um baralho
  @Get('baralhos/:baralhoId')
  async obterPorBaralho(@Param('baralhoId') baralhoId: string) {
    return this.estatisticasService.obterPorBaralho(baralhoId);
  }
}
