import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsuariosService } from './usuarios.service.js';

describe('UsuariosService', () => {
  it('retorna os usuários paginados sem senhaHash', async () => {
    const dados = [
      {
        id: 'usuario-id',
        nome: 'Ana Souza',
        email: 'ana@exemplo.local',
        perfil: 'estudante',
        createdAt: new Date('2026-10-25T12:00:00.000Z'),
      },
    ];
    const prisma = {
      usuario: {
        findMany: vi.fn().mockResolvedValue(dados),
        count: vi.fn().mockResolvedValue(1),
      },
    } as unknown as PrismaService;

    const resposta = await new UsuariosService(prisma).listar({
      page: 2,
      limit: 10,
    });

    expect(prisma.usuario.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(resposta).toEqual({ dados, total: 1, page: 2, limit: 10 });
  });
});
