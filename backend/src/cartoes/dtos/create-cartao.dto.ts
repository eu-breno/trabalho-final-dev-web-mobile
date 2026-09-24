import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCartaoDTO {
  @IsString()
  @IsNotEmpty({ message: 'A frente do cartão é obrigatória' })
  frente: string;

  @IsString()
  @IsNotEmpty({ message: 'O verso do cartão é obrigatório' })
  verso: string;

  @IsUUID('4', { message: 'O ID do baralho deve ser um UUID válido' })
  @IsNotEmpty()
  baralhoId: string;
}
