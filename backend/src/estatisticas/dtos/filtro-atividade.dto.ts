import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class FiltroAtividadeDTO {
  @Type(() => Number)
  @IsIn([7, 30, 90], {
    message: 'O período deve ser de 7, 30 ou 90 dias',
  })
  @IsOptional()
  dias = 7;
}
