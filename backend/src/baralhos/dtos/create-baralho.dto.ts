import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBaralhoDTO {
  @IsString()
  @IsNotEmpty({ message: 'O nome do baralho é obrigatório' })
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
