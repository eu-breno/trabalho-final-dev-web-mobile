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

  it.each([
    ['geral', undefined],
    ['semana', '2026-10-19T03:00:00.000Z'],
    ['mes', '2026-10-01T03:00:00.000Z'],
  ] as const)(
    'calcula métricas e aplica o período %s',
    async (periodo, inicioEsperado) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-24T15:00:00.000Z'));

      const revisoesPeriodo = [
        { nota: 'bom' },
        { nota: 'facil' },
        { nota: 'errei' },
      ];
      const hoje = new Date('2026-10-24T14:00:00.000Z');
      const ontem = new Date('2026-10-23T14:00:00.000Z');
      const anteontem = new Date('2026-10-22T14:00:00.000Z');
      const revisoesOrdenadas = [hoje, ontem, anteontem].map((revisadoEm) => ({
        revisadoEm,
      }));
      const revisoesSemana = [
        { revisadoEm: hoje },
        { revisadoEm: hoje },
        { revisadoEm: ontem },
      ];
      const findMany = vi
        .fn()
        .mockResolvedValueOnce(revisoesPeriodo)
        .mockResolvedValueOnce(revisoesOrdenadas)
        .mockResolvedValueOnce(revisoesSemana);
      const prisma = {
        baralho: { count: vi.fn().mockResolvedValue(2) },
        cartao: { count: vi.fn().mockResolvedValue(5) },
        revisao: { findMany },
      } as unknown as PrismaService;

      const resultado = await new EstatisticasService(prisma).obterGerais(
        'usuario-id',
        { periodo },
      );

      expect(resultado).toMatchObject({
        totalBaralhos: 2,
        totalCartoes: 5,
        cartoesEstudados: 3,
        taxaAcertoPorcentagem: (2 / 3) * 100,
        sequenciaDiasAtual: 3,
        periodoFiltro: periodo,
        atividadeSemanal: [
          { dia: 'Seg', total: 0 },
          { dia: 'Ter', total: 0 },
          { dia: 'Qua', total: 0 },
          { dia: 'Qui', total: 0 },
          { dia: 'Sex', total: 1 },
          { dia: 'Sáb', total: 2 },
          { dia: 'Dom', total: 0 },
        ],
      });

      const filtroPeriodo = findMany.mock.calls[0][0].where.revisadoEm;
      if (inicioEsperado) {
        expect(filtroPeriodo.gte.toISOString()).toBe(inicioEsperado);
      } else {
        expect(filtroPeriodo).toBeUndefined();
      }
      expect(findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          orderBy: { revisadoEm: 'desc' },
        }),
      );
    },
  );

  it('calcula retenção por baralho e rejeita baralho de outro usuário', async () => {
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'baralho-id',
        cartoes: [
          { id: 'cartao-1', revisoes: [{ nota: 'bom' }, { nota: 'errei' }] },
          { id: 'cartao-2', revisoes: [{ nota: 'facil' }] },
          { id: 'cartao-3', revisoes: [] },
        ],
      })
      .mockResolvedValueOnce(null);
    const prisma = { baralho: { findFirst } } as unknown as PrismaService;
    const service = new EstatisticasService(prisma);

    await expect(
      service.obterPorBaralho('baralho-id', 'usuario-id'),
    ).resolves.toEqual({
      baralhoId: 'baralho-id',
      totalCartoes: 3,
      cartoesRevisados: 2,
      retencaoPorcentagem: (2 / 3) * 100,
    });
    await expect(
      service.obterPorBaralho('baralho-alheio', 'usuario-id'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
