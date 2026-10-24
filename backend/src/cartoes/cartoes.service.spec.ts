import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotaRevisao } from './dtos/create-revisao.dto.js';
import { CartoesService } from './cartoes.service.js';

describe('CartoesService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('mantém um cartão marcado como errado pendente para revisão no mesmo dia', async () => {
    const instanteRevisao = new Date('2026-10-24T15:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(instanteRevisao);

    const cartao = {
      id: 'cartao-id',
      baralhoId: 'baralho-id',
      frente: 'Pergunta',
      verso: 'Resposta',
      facilidade: 2.5,
      repeticoes: 0,
      intervaloDias: 0,
      proximaRevisao: instanteRevisao,
      ultimaRevisao: null,
      createdAt: instanteRevisao,
      updatedAt: instanteRevisao,
    };
    const cartaoAtualizado = { ...cartao, proximaRevisao: instanteRevisao, ultimaRevisao: instanteRevisao };
    let dadosAtualizados:
      | { intervaloDias: number; proximaRevisao: Date; ultimaRevisao: Date }
      | undefined;
    const atualizarCartao = vi.fn(
      async (args: {
        data: {
          intervaloDias: number;
          proximaRevisao: Date;
          ultimaRevisao: Date;
        };
      }) => {
        dadosAtualizados = args.data;
        return cartaoAtualizado;
      },
    );
    const transacao = {
      cartao: { update: atualizarCartao },
      revisao: { create: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      cartao: { findFirst: vi.fn().mockResolvedValue(cartao) },
      $transaction: vi.fn(
        (executar: (transaction: typeof transacao) => Promise<unknown>) =>
          executar(transacao),
      ),
    } as unknown as PrismaService;

    const service = new CartoesService(prisma);
    await service.registrarRevisao(
      cartao.id,
      { nota: NotaRevisao.errei },
      'usuario-id',
    );

    expect(dadosAtualizados?.intervaloDias).toBe(0);
    expect(dadosAtualizados?.proximaRevisao).toEqual(instanteRevisao);
    expect(dadosAtualizados?.proximaRevisao.getTime()).toBeLessThanOrEqual(Date.now());
    expect(transacao.revisao.create).toHaveBeenCalledOnce();
  });
});
