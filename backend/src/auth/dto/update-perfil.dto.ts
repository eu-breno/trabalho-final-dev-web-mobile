import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: 120, required: false })
  @IsOptional()
  @IsString({ message: 'o nome deve ser um texto' })
  @MinLength(2, { message: 'o nome deve ter pelo menos 2 caracteres' })
  @MaxLength(120, { message: 'o nome deve ter no máximo 120 caracteres' })
  nome?: string;

  @ApiProperty({ example: 'ana@exemplo.com', maxLength: 180, required: false })
  @IsOptional()
  @IsEmail({}, { message: 'informe um email válido' })
  @MaxLength(180, { message: 'o email deve ter no máximo 180 caracteres' })
  email?: string;
}
