import { IsEnum, IsNotEmpty } from 'class-validator';

export enum NotaRevisao {
  errei = 'errei',
  dificil = 'dificil',
  bom = 'bom',
  facil = 'facil',
}

export class CreateRevisaoDTO {
  @IsEnum(NotaRevisao)
  @IsNotEmpty()
  nota: NotaRevisao;
}
