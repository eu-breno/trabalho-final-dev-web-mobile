import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotaRevisao } from './dtos/create-revisao.dto.js';
import { CartoesService } from './cartoes.service.js';

describe('CartoesService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [NotaRevisao.errei, 0],
    [NotaRevisao.dificil, 1],
    [NotaRevisao.bom, 3],
    [NotaRevisao.facil, 7],
  ] as const)(
    'grava a revisão %s com intervalo de %i dia(s)',
    async (nota, intervaloDias) => {
      const instanteRevisao = new Date('2026-10-24T15:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(instanteRevisao);

      const cartao = {
        id: 'cartao-id',
        baralhoId: 'baralho-id',
        frente: 'Pergunta',
        verso: 'Resposta',
        facilidade: 2.5,
        repeticoes: 3,
        intervaloDias: 5,
        proximaRevisao: instanteRevisao,
        ultimaRevisao: null,
        createdAt: instanteRevisao,
        updatedAt: instanteRevisao,
      };
      const revisado = new Date(instanteRevisao);
      const proximaRevisaoEsperada = new Date(instanteRevisao);
      proximaRevisaoEsperada.setDate(
        proximaRevisaoEsperada.getDate() + intervaloDias,
      );
      const cartaoAtualizado = {
        ...cartao,
        repeticoes: cartao.repeticoes + 1,
        intervaloDias,
        proximaRevisao: proximaRevisaoEsperada,
        ultimaRevisao: revisado,
      };
      const atualizarCartao = vi.fn().mockResolvedValue(cartaoAtualizado);
      const criarRevisao = vi.fn().mockResolvedValue({});
      const transacao = {
        cartao: { update: atualizarCartao },
        revisao: { create: criarRevisao },
      };
      const prisma = {
        cartao: { findFirst: vi.fn().mockResolvedValue(cartao) },
        $transaction: vi.fn(
          (executar: (transaction: typeof transacao) => Promise<unknown>) =>
            executar(transacao),
        ),
      } as unknown as PrismaService;

      const resultado = await new CartoesService(prisma).registrarRevisao(
        cartao.id,
        { nota },
        'usuario-id',
      );

      expect(atualizarCartao).toHaveBeenCalledWith({
        where: { id: cartao.id },
        data: {
          intervaloDias,
          repeticoes: { increment: 1 },
          proximaRevisao: proximaRevisaoEsperada,
          ultimaRevisao: revisado,
        },
      });
      expect(criarRevisao).toHaveBeenCalledWith({
        data: {
          cartaoId: cartao.id,
          nota,
          intervaloAnteriorDias: 5,
          intervaloNovoDias: intervaloDias,
        },
      });
      expect(resultado).toMatchObject({
        repeticoes: 4,
        intervaloDias,
        facilidade: 2.5,
        proximaRevisao: proximaRevisaoEsperada,
        ultimaRevisao: revisado,
      });
      expect(proximaRevisaoEsperada.getTime()).toBeGreaterThanOrEqual(
        Date.now(),
      );
    },
  );
});
