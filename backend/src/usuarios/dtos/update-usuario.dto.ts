import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDTO {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsOptional()
  email?: string;
}
