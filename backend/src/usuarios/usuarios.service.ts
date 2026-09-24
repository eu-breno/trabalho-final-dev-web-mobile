import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUsuarioDTO } from './dtos/update-usuario.dto.js';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  criadoEm: Date;
}

@Injectable()
export class UsuariosService {
  private usuarios: Usuario[] = [
    {
      id: 'id-do-usuario-logado',
      nome: 'Matheus',
      email: 'usuario@email.com',
      senha: 'suasenhasegura',
      criadoEm: new Date(),
    },
  ];

  async buscarPorId(id: string): Promise<Omit<Usuario, 'senha'>> {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  async atualizar(
    id: string,
    dto: UpdateUsuarioDTO,
  ): Promise<Omit<Usuario, 'senha'>> {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    Object.assign(usuario, dto);

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
}
