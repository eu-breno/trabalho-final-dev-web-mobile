import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaralhosService } from './baralhos.service.js';

describe('BaralhosService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('lista apenas os baralhos do usuário com contagem de cartões pendentes', async () => {
    const agora = new Date('2026-10-24T15:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(agora);
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'baralho-id',
        usuarioId: 'usuario-id',
        nome: 'Inglês',
        cartoes: [
          { proximaRevisao: new Date(agora.getTime() - 1) },
          { proximaRevisao: agora },
          { proximaRevisao: new Date(agora.getTime() + 1) },
        ],
      },
    ]);
    const prisma = { baralho: { findMany } } as unknown as PrismaService;

    await expect(
      new BaralhosService(prisma).listarTodos('usuario-id'),
    ).resolves.toEqual([
      {
        id: 'baralho-id',
        usuarioId: 'usuario-id',
        nome: 'Inglês',
        totalCartoes: 3,
        cartoesPendentes: 2,
      },
    ]);
    expect(findMany).toHaveBeenCalledWith({
      where: { usuarioId: 'usuario-id' },
      orderBy: { nome: 'asc' },
      include: { cartoes: { select: { proximaRevisao: true } } },
    });
  });

  it('não permite buscar um baralho de outro usuário', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const findMany = vi.fn();
    const prisma = {
      baralho: { findFirst },
      cartao: { findMany },
    } as unknown as PrismaService;

    await expect(
      new BaralhosService(prisma).buscarPorId('baralho-alheio', 'usuario-id'),
    ).rejects.toMatchObject({ status: 404 });
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'baralho-alheio', usuarioId: 'usuario-id' },
      include: { cartoes: { select: { proximaRevisao: true } } },
    });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('filtra a fila global pendente pelo proprietário e pela data de revisão', async () => {
    const agora = new Date('2026-10-24T15:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(agora);
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { cartao: { findMany } } as unknown as PrismaService;

    await new BaralhosService(prisma).obterFilaEstudoGlobal('usuario-id', {
      escopo: 'pendentes',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        baralho: { usuarioId: 'usuario-id' },
        proximaRevisao: { lte: agora },
      },
      orderBy: [{ proximaRevisao: 'asc' }, { id: 'asc' }],
    });
  });

  it('remove somente um baralho próprio depois de confirmar a propriedade', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'baralho-id',
      usuarioId: 'usuario-id',
      nome: 'Inglês',
      cartoes: [],
    });
    const deleteBaralho = vi.fn().mockResolvedValue({ id: 'baralho-id' });
    const prisma = {
      baralho: { findFirst, delete: deleteBaralho },
    } as unknown as PrismaService;

    await expect(
      new BaralhosService(prisma).remover('baralho-id', 'usuario-id'),
    ).resolves.toBeUndefined();

    expect(findFirst).toHaveBeenCalled();
    expect(deleteBaralho).toHaveBeenCalledWith({ where: { id: 'baralho-id' } });
  });
});
