import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ana@exemplo.com', maxLength: 180 })
  @IsEmail({}, { message: 'informe um email válido' })
  @MaxLength(180)
  email!: string;

  @ApiProperty({ example: 'umaSenhaForte123' })
  @IsString()
  @IsNotEmpty({ message: 'a senha é obrigatória' })
  senha!: string;
}
