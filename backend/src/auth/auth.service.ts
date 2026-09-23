import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dtos/login.dto.js';
import { RegistroDTO } from './dtos/registro.dto.js';

@Injectable()
export class AuthService {
  async registrar(dto: RegistroDTO) {
    return {
      message: 'Usuário registrado com sucesso!',
      user: { nome: dto.nome, email: dto.email },
    };
  }

  async login(dto: LoginDTO) {
    return {
      access_token: 'seu_token_jwt_aqui',
    };
  }

  async obterPerfil(usuarioId: string) {
    return {
      id: usuarioId,
      nome: 'Estudante Exemplo',
      email: 'estudante@exemplo.com',
    };
  }
}
