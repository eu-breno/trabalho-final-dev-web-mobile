import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSenhaDto {
  @ApiProperty({ example: 'senhaAtual123', minLength: 8 })
  @IsString({ message: 'a senha deve ser um texto' })
  @MinLength(8, { message: 'a senha atual deve ter pelo menos 8 caracteres' })
  senhaAtual!: string;

  @ApiProperty({ example: 'novaSenhaForte123', minLength: 8 })
  @IsString({ message: 'a nova senha deve ser um texto' })
  @MinLength(8, { message: 'a nova senha deve ter pelo menos 8 caracteres' })
  @MaxLength(72, { message: 'a nova senha deve ter no máximo 72 caracteres' })
  novaSenha!: string;
}
