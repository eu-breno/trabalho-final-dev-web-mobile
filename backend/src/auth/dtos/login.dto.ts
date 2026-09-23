import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}
