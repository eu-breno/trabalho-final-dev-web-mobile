import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client.js';
import { Perfil } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, vi } from 'vitest';

function criarService(prisma: object, jwt = { signAsync: vi.fn() }) {
  return new AuthService(
    prisma as PrismaService,
    jwt as unknown as JwtService,
  );
}

describe('AuthService', () => {
  it('cadastra sempre como estudante e não retorna o hash da senha', async () => {
    const usuario = {
      id: 'usuario-id',
      nome: 'Ana',
      email: 'ana@example.com',
      senhaHash: 'hash',
      perfil: Perfil.estudante,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const create = vi.fn().mockResolvedValue(usuario);
    const service = criarService({ usuario: { create } });

    await expect(
      service.registrar({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'senha-segura',
      }),
    ).resolves.toEqual({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: Perfil.estudante,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'ana@example.com',
        perfil: Perfil.estudante,
        senhaHash: expect.any(String),
      }),
    });
  });

  it('converte e-mail duplicado do Prisma em conflito', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { target: ['email'] },
      },
    );
    const create = vi.fn().mockRejectedValue(duplicate);

    await expect(
      criarService({ usuario: { create } }).registrar({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'senha-segura',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('aceita exatamente 72 bytes e rejeita cadastro acima do limite', async () => {
    const create = vi.fn().mockImplementation(async ({ data }) => data);
    const service = criarService({ usuario: { create } });

    await expect(
      service.registrar({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: '😀'.repeat(18),
      }),
    ).resolves.toMatchObject({ perfil: Perfil.estudante });

    await expect(
      service.registrar({
        nome: 'Bia',
        email: 'bia@example.com',
        senha: '😀'.repeat(18) + 'a',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).toHaveBeenCalledOnce();
  });

  it('usa a mesma resposta para e-mail inexistente e senha incorreta', async () => {
    const findUnique = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({
      senhaHash: await bcrypt.hash('senha-certa', 4),
    });
    const service = criarService({ usuario: { findUnique } });

    await expect(
      service.login({ email: 'nao-existe@example.com', senha: 'senha-errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.login({ email: 'ana@example.com', senha: 'senha-errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejeita login com senha acima de 72 bytes sem consultar o usuário', async () => {
    const findUnique = vi.fn();

    await expect(
      criarService({ usuario: { findUnique } }).login({
        email: 'ana@example.com',
        senha: '😀'.repeat(19),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('assina um token após validar a senha correta', async () => {
    const senhaHash = await bcrypt.hash('senha-certa', 4);
    const findUnique = vi.fn().mockResolvedValue({
      id: 'usuario-id',
      perfil: Perfil.estudante,
      senhaHash,
    });
    const jwt = { signAsync: vi.fn().mockResolvedValue('token-assinado') };

    await expect(
      criarService({ usuario: { findUnique } }, jwt).login({
        email: 'ana@example.com',
        senha: 'senha-certa',
      }),
    ).resolves.toEqual({ accessToken: 'token-assinado' });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'usuario-id',
      perfil: Perfil.estudante,
    });
  });

  it('altera a senha somente depois de conferir a atual', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    const usuarioPublico = {
      id: 'usuario-id',
      nome: 'Ana',
      email: 'ana@example.com',
      perfil: Perfil.estudante,
    };
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ senhaHash })
      .mockResolvedValueOnce(usuarioPublico);
    const update = vi.fn().mockResolvedValue({});
    const service = criarService({ usuario: { findUnique, update } });

    await expect(
      service.atualizarSenha('usuario-id', {
        senhaAtual: 'senha-atual',
        novaSenha: 'nova-senha',
      }),
    ).resolves.toEqual(usuarioPublico);
    const senhaAtualizada = update.mock.calls[0][0].data.senhaHash;
    await expect(bcrypt.compare('nova-senha', senhaAtualizada)).resolves.toBe(
      true,
    );
  });

  it('não troca a senha se a atual for incorreta nem se a nova exceder 72 bytes', async () => {
    const senhaHash = await bcrypt.hash('senha-atual', 4);
    const findUnique = vi
      .fn()
      .mockResolvedValue({ senhaHash })
      .mockResolvedValueOnce({ senhaHash });
    const update = vi.fn();
    const service = criarService({ usuario: { findUnique, update } });

    await expect(
      service.atualizarSenha('usuario-id', {
        senhaAtual: 'incorreta',
        novaSenha: 'nova-senha',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.atualizarSenha('usuario-id', {
        senhaAtual: 'senha-atual',
        novaSenha: '😀'.repeat(19),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
});
