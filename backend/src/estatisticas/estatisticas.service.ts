import { Injectable } from '@nestjs/common';
import { FiltroEstatisticasDTO } from './dtos/filtro-estatisticas.dto.js';

export interface EstatisticasGerais {
  totalBaralhos: number;
  totalCartoes: number;
  cartoesEstudados: number;
  taxaAcertoPorcentagem: number;
  sequenciaDiasAtual: number;
  periodoFiltro: string;
}

export interface EstatisticasBaralho {
  baralhoId: string;
  totalCartoes: number;
  cartoesRevisados: number;
  retencaoPorcentagem: number;
}

@Injectable()
export class EstatisticasService {
  async obterGerais(
    usuarioId: string,
    filtro: FiltroEstatisticasDTO,
  ): Promise<EstatisticasGerais> {
    return {
      totalBaralhos: 5,
      totalCartoes: 120,
      cartoesEstudados: 45,
      taxaAcertoPorcentagem: 82.5,
      sequenciaDiasAtual: 4,
      periodoFiltro: filtro.periodo || 'geral',
    };
  }

  async obterPorBaralho(baralhoId: string): Promise<EstatisticasBaralho> {
    return {
      baralhoId,
      totalCartoes: 30,
      cartoesRevisados: 18,
      retencaoPorcentagem: 88.0,
    };
  }
}
