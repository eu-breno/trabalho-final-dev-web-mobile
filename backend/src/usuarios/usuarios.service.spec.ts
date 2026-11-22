import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client.js';
import { BaralhosService } from '../baralhos/baralhos.service.js';
import { EstatisticasService } from '../estatisticas/estatisticas.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsuariosService } from './usuarios.service.js';

function criarService(
  prisma: PrismaService,
  baralhosService = { listarTodos: vi.fn().mockResolvedValue([]) },
  estatisticasService = {
    obterGerais: vi.fn(),
    obterAtividade: vi.fn(),
    obterPorBaralho: vi.fn(),
  },
) {
  return new UsuariosService(
    prisma,
    baralhosService as unknown as BaralhosService,
    estatisticasService as unknown as EstatisticasService,
  );
}

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

    const resposta = await criarService(prisma).listar({
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

  it('rejeita senha incorreta sem consultar a existência do alvo', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({ senhaHash }),
        delete: vi.fn(),
      },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('alvo-id', 'admin-id', 'senha-errada'),
    ).rejects.toMatchObject({ status: 403 });

    expect(prisma.usuario.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 'admin-id' },
      select: { senhaHash: true },
    });
    expect(prisma.usuario.delete).not.toHaveBeenCalled();
  });

  it('rejeita a exclusão se a conta do administrador autenticado não existir', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const deleteUser = vi.fn();
    const prisma = {
      usuario: { findUnique, delete: deleteUser },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('alvo-id', 'admin-id', 'senha'),
    ).rejects.toMatchObject({ status: 401 });
    expect(findUnique).toHaveBeenCalledOnce();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('bloqueia a autoexclusão somente depois de validar a senha', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({ senhaHash }),
        delete: vi.fn(),
      },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('admin-id', 'admin-id', 'senha-correta'),
    ).rejects.toMatchObject({ status: 409 });

    expect(prisma.usuario.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.usuario.delete).not.toHaveBeenCalled();
  });

  it('retorna 404 quando o usuário-alvo não existe após validar a senha', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const prisma = {
      usuario: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ senhaHash })
          .mockResolvedValueOnce(null),
        delete: vi.fn(),
      },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('alvo-id', 'admin-id', 'senha-correta'),
    ).rejects.toMatchObject({ status: 404 });

    expect(prisma.usuario.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: 'alvo-id' },
      select: { id: true },
    });
    expect(prisma.usuario.delete).not.toHaveBeenCalled();
  });

  it('exclui o usuário depois de autenticar o administrador e encontrar o alvo', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const prisma = {
      usuario: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ senhaHash })
          .mockResolvedValueOnce({ id: 'alvo-id' }),
        delete: vi.fn().mockResolvedValue({ id: 'alvo-id' }),
      },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('alvo-id', 'admin-id', 'senha-correta'),
    ).resolves.toBeUndefined();

    expect(prisma.usuario.delete).toHaveBeenCalledWith({
      where: { id: 'alvo-id' },
    });
  });

  it('converte exclusão concorrente em 404 se o usuário sumir antes do delete', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 4);
    const deleteError = new Prisma.PrismaClientKnownRequestError(
      'Record not found',
      { code: 'P2025', clientVersion: '7.10.0' },
    );
    const prisma = {
      usuario: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ senhaHash })
          .mockResolvedValueOnce({ id: 'alvo-id' }),
        delete: vi.fn().mockRejectedValue(deleteError),
      },
    } as unknown as PrismaService;

    await expect(
      criarService(prisma).excluir('alvo-id', 'admin-id', 'senha-correta'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('retorna contagens agregadas para o detalhe sem selecionar senhaHash', async () => {
    const createdAt = new Date('2026-10-25T12:00:00.000Z');
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'usuario-id',
          nome: 'Ana Souza',
          email: 'ana@exemplo.local',
          perfil: 'estudante',
          createdAt,
        }),
      },
      baralho: { count: vi.fn().mockResolvedValue(2) },
      cartao: { count: vi.fn().mockResolvedValueOnce(9).mockResolvedValueOnce(3) },
    } as unknown as PrismaService;

    await expect(criarService(prisma).obterDetalhe('usuario-id')).resolves.toEqual({
      id: 'usuario-id',
      nome: 'Ana Souza',
      email: 'ana@exemplo.local',
      perfil: 'estudante',
      createdAt,
      totalBaralhos: 2,
      totalCartoes: 9,
      cartoesPendentes: 3,
    });

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 'usuario-id' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
      },
    });
    expect(prisma.cartao.count).toHaveBeenLastCalledWith({
      where: {
        baralho: { usuarioId: 'usuario-id' },
        proximaRevisao: { lte: expect.any(Date) },
      },
    });
  });

  it('retorna 404 no detalhe de um usuário inexistente', async () => {
    const prisma = {
      usuario: { findUnique: vi.fn().mockResolvedValue(null) },
      baralho: { count: vi.fn() },
      cartao: { count: vi.fn() },
    } as unknown as PrismaService;

    await expect(criarService(prisma).obterDetalhe('inexistente')).rejects.toMatchObject({
      status: 404,
    });
    expect(prisma.baralho.count).not.toHaveBeenCalled();
    expect(prisma.cartao.count).not.toHaveBeenCalled();
  });

  it('retorna 404 para estatísticas, atividade e baralhos de usuário inexistente', async () => {
    const prisma = {
      usuario: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const estatisticasService = {
      obterGerais: vi.fn(),
      obterAtividade: vi.fn(),
      obterPorBaralho: vi.fn(),
    };
    const baralhosService = { listarTodos: vi.fn() };
    const service = criarService(prisma, baralhosService, estatisticasService);

    await expect(service.obterEstatisticas('inexistente', {})).rejects.toMatchObject({
      status: 404,
    });
    await expect(service.obterAtividade('inexistente', { dias: 7 })).rejects.toMatchObject({
      status: 404,
    });
    await expect(service.listarBaralhos('inexistente')).rejects.toMatchObject({
      status: 404,
    });

    expect(estatisticasService.obterGerais).not.toHaveBeenCalled();
    expect(estatisticasService.obterAtividade).not.toHaveBeenCalled();
    expect(baralhosService.listarTodos).not.toHaveBeenCalled();
  });

  it('reaproveita serviços existentes para as métricas do usuário-alvo', async () => {
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usuario-id' }),
      },
    } as unknown as PrismaService;
    const decks = [
      {
        id: 'baralho-id',
        nome: 'Inglês',
        descricao: null,
        totalCartoes: 5,
        cartoesPendentes: 2,
      },
    ];
    const baralhosService = { listarTodos: vi.fn().mockResolvedValue(decks) };
    const estatisticasService = {
      obterGerais: vi.fn().mockResolvedValue({ totalBaralhos: 1 }),
      obterAtividade: vi.fn().mockResolvedValue([{ data: '2026-10-25', total: 1 }]),
      obterPorBaralho: vi.fn().mockResolvedValue({
        baralhoId: 'baralho-id',
        totalCartoes: 5,
        cartoesRevisados: 3,
        retencaoPorcentagem: 75,
      }),
    };
    const service = criarService(prisma, baralhosService, estatisticasService);

    await expect(service.obterEstatisticas('usuario-id', {})).resolves.toEqual({
      totalBaralhos: 1,
    });
    await expect(service.obterAtividade('usuario-id', { dias: 30 })).resolves.toEqual([
      { data: '2026-10-25', total: 1 },
    ]);
    await expect(service.listarBaralhos('usuario-id')).resolves.toEqual([
      {
        ...decks[0],
        cartoesRevisados: 3,
        retencaoPorcentagem: 75,
      },
    ]);

    expect(estatisticasService.obterGerais).toHaveBeenCalledWith('usuario-id', {});
    expect(estatisticasService.obterAtividade).toHaveBeenCalledWith('usuario-id', 30);
    expect(baralhosService.listarTodos).toHaveBeenCalledWith('usuario-id');
    expect(estatisticasService.obterPorBaralho).toHaveBeenCalledWith(
      'baralho-id',
      'usuario-id',
    );
  });
});
