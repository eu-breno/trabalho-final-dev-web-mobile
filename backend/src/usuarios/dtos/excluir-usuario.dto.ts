import { IsNotEmpty, IsString } from 'class-validator';
import { LIMITE_SENHA_BCRYPT_BYTES, MaxUtf8Bytes } from '../../auth/validators/senha-tamanho.validator.js';

export class ExcluirUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxUtf8Bytes(LIMITE_SENHA_BCRYPT_BYTES, {
    message: 'A senha deve ter no máximo 72 bytes em UTF-8',
  })
  senha!: string;
}
