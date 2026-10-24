import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstatisticasService } from './estatisticas.service.js';

describe('EstatisticasService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('agrupa acertos e erros por dia e inclui datas sem revisões', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-24T15:00:00.000Z'));

    const prisma = {
      revisao: {
        findMany: vi.fn().mockResolvedValue([
          { nota: 'bom', revisadoEm: new Date('2026-10-24T14:00:00.000Z') },
          { nota: 'errei', revisadoEm: new Date('2026-10-24T15:00:00.000Z') },
          { nota: 'facil', revisadoEm: new Date('2026-10-23T14:00:00.000Z') },
        ]),
      },
    } as unknown as PrismaService;

    const atividade = await new EstatisticasService(prisma).obterAtividade(
      'usuario-id',
      7,
    );

    expect(atividade).toHaveLength(7);
    expect(atividade.find((dia) => dia.data === '2026-10-24')).toMatchObject({
      total: 2,
      acertos: 1,
      erros: 1,
    });
    expect(atividade.find((dia) => dia.data === '2026-10-23')).toMatchObject({
      total: 1,
      acertos: 1,
      erros: 0,
    });
    expect(atividade.some((dia) => dia.total === 0)).toBe(true);
  });
});
