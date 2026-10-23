import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSenhaDto {
  @ApiProperty({ example: 'novaSenhaForte123', minLength: 8, required: false })
  @IsOptional()
  @IsString({ message: 'a senha deve ser um texto' })
  @MinLength(8, { message: 'a senha deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'a senha deve ter no máximo 72 bytes' })
  senha?: string;
}
