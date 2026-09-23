import { IsEnum, IsOptional } from 'class-validator';

export enum PeriodoEnum {
  HOJE = 'hoje',
  SEMANA = 'semana',
  MES = 'mes',
  GERAL = 'geral',
}

export class FiltroEstatisticasDTO {
  @IsEnum(PeriodoEnum, {
    message: 'O período deve ser: hoje, semana, mes ou geral',
  })
  @IsOptional()
  periodo?: PeriodoEnum = PeriodoEnum.GERAL;
}
