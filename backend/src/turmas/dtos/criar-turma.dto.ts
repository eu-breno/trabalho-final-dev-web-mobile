import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CriarTurmaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da turma é obrigatório' })
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsNotEmpty({ message: "Qual o código da turma?" })
  codigo: string;
}
