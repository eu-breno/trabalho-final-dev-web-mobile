import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, } from 'class-validator';

export class RegistrarDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: 120 })
  @IsString()
  @IsNotEmpty({ message: 'o nome é obrigatório' })
  @MaxLength(120)
  nome!: string;

  @ApiProperty({ example: 'ana@exemplo.com', maxLength: 180 })
  @IsEmail({}, { message: 'informe um email válido' })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: 'umaSenhaForte123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'a senha precisa ter pelo menos 8 caracteres' })
  senha!: string;
}
