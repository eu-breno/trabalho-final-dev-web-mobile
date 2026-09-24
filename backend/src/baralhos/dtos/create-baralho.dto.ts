import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBaralhoDTO {
  @IsString()
  @IsNotEmpty({ message: 'O título do baralho é obrigatório' })
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
