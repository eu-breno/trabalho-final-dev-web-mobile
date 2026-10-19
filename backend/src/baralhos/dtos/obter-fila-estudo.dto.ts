import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ObterFilaEstudoDTO {
  @IsOptional()
  @IsIn(['pendentes', 'todos'])
  escopo?: 'pendentes' | 'todos';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cartaoId?: string;
}
