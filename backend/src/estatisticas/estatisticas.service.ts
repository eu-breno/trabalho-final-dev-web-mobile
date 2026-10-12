import { Injectable, NotFoundException } from '@nestjs/common';
import { FiltroEstatisticasDTO } from './dtos/filtro-estatisticas.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface EstatisticasGerais {
  totalBaralhos: number;
  totalCartoes: number;
  cartoesEstudados: number;
  taxaAcertoPorcentagem: number;
  sequenciaDiasAtual: number;
  periodoFiltro: string;
  atividadeSemanal: { dia: string; total: number }[];
}

export interface EstatisticasBaralho {
  baralhoId: string;
  totalCartoes: number;
  cartoesRevisados: number;
  retencaoPorcentagem: number;
}

const timezone = 'America/Sao_Paulo';
const formatadorData = new Intl.DateTimeFormat('en-US', {
  timeZone: timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const formatadorHorario = new Intl.DateTimeFormat('en-US', {
  timeZone: timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function chaveDoDia(data: Date) {
  const partes = Object.fromEntries(
    formatadorData.formatToParts(data).map(({ type, value }) => [type, value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}

function dataInicioNoFuso(chave: string) {
  const [ano, mes, dia] = chave.split('-').map(Number);
  const referencia = new Date(`${chave}T12:00:00Z`);
  const horarioLocal = Object.fromEntries(
    formatadorHorario.formatToParts(referencia).map(({ type, value }) => [type, value]),
  );
  const horarioUtc = Date.UTC(
    Number(horarioLocal.year),
    Number(horarioLocal.month) - 1,
    Number(horarioLocal.day),
    Number(horarioLocal.hour),
    Number(horarioLocal.minute),
    Number(horarioLocal.second),
  );
  const deslocamento = horarioUtc - referencia.getTime();
  return new Date(Date.UTC(ano, mes - 1, dia) - deslocamento);
}

@Injectable()
export class EstatisticasService {
  constructor(private readonly prisma: PrismaService) {}

  async obterGerais(
    usuarioId: string,
    filtro: FiltroEstatisticasDTO,
  ): Promise<EstatisticasGerais> {
    const agora = new Date();
    const periodo = filtro.periodo ?? 'geral';
    const hoje = chaveDoDia(agora);
    const hojeCalendario = new Date(`${hoje}T00:00:00Z`);
    const diaSemana = (hojeCalendario.getUTCDay() + 6) % 7;
    hojeCalendario.setUTCDate(hojeCalendario.getUTCDate() - diaSemana);
    const inicioSemanaChave = hojeCalendario.toISOString().slice(0, 10);
    const inicioSemana = dataInicioNoFuso(inicioSemanaChave);

    const inicioPeriodoChave = hoje;
    const inicioPeriodo = dataInicioNoFuso(
      periodo === 'semana'
        ? inicioSemanaChave
        : periodo === 'mes'
          ? `${hoje.slice(0, 7)}-01`
          : inicioPeriodoChave,
    );

    const filtroUsuario = { cartao: { baralho: { usuarioId } } };
    const [totalBaralhos, totalCartoes, revisoesPeriodo, todasRevisoes, revisoesSemana] =
      await Promise.all([
        this.prisma.baralho.count({ where: { usuarioId } }),
        this.prisma.cartao.count({ where: { baralho: { usuarioId } } }),
        this.prisma.revisao.findMany({
          where: {
            ...filtroUsuario,
            ...(periodo === 'geral' ? {} : { revisadoEm: { gte: inicioPeriodo } }),
          },
          select: { nota: true },
        }),
        this.prisma.revisao.findMany({
          where: filtroUsuario,
          select: { revisadoEm: true },
          orderBy: { revisadoEm: 'desc' },
        }),
        this.prisma.revisao.findMany({
          where: { ...filtroUsuario, revisadoEm: { gte: inicioSemana } },
          select: { revisadoEm: true },
        }),
      ]);

    const acertos = revisoesPeriodo.filter(
      (revisao) => revisao.nota === 'bom' || revisao.nota === 'facil',
    ).length;
    const diasComRevisao = new Set(
      todasRevisoes.map((revisao) => chaveDoDia(revisao.revisadoEm)),
    );
    const hojeUtc = new Date(`${hoje}T00:00:00Z`);
    const ontemUtc = new Date(hojeUtc);
    ontemUtc.setUTCDate(ontemUtc.getUTCDate() - 1);
    const ontem = ontemUtc.toISOString().slice(0, 10);
    let dataAtual = diasComRevisao.has(hoje)
      ? hojeUtc
      : diasComRevisao.has(ontem)
        ? ontemUtc
        : null;
    let sequenciaDiasAtual = 0;
    while (dataAtual && diasComRevisao.has(dataAtual.toISOString().slice(0, 10))) {
      sequenciaDiasAtual += 1;
      dataAtual = new Date(dataAtual);
      dataAtual.setUTCDate(dataAtual.getUTCDate() - 1);
    }

    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const atividadeSemanal = dias.map((dia, indice) => {
      const dataCalendario = new Date(`${inicioSemanaChave}T00:00:00Z`);
      dataCalendario.setUTCDate(dataCalendario.getUTCDate() + indice);
      const chave = dataCalendario.toISOString().slice(0, 10);
      const total = revisoesSemana.filter(
        (revisao) => chaveDoDia(revisao.revisadoEm) === chave,
      ).length;
      return { dia, total };
    });

    return {
      totalBaralhos,
      totalCartoes,
      cartoesEstudados: revisoesPeriodo.length,
      taxaAcertoPorcentagem:
        revisoesPeriodo.length === 0 ? 0 : (acertos / revisoesPeriodo.length) * 100,
      sequenciaDiasAtual,
      periodoFiltro: periodo,
      atividadeSemanal,
    };
  }

  async obterPorBaralho(baralhoId: string, usuarioId: string): Promise<EstatisticasBaralho> {
    const baralho = await this.prisma.baralho.findFirst({
      where: { id: baralhoId, usuarioId },
      select: { id: true, cartoes: { select: { id: true, revisoes: { select: { nota: true } } } } },
    });
    if (!baralho) throw new NotFoundException('Baralho não encontrado');

    const revisoes = baralho.cartoes.flatMap((cartao) => cartao.revisoes);
    const acertos = revisoes.filter(
      (revisao) => revisao.nota === 'bom' || revisao.nota === 'facil',
    ).length;
    return {
      baralhoId: baralho.id,
      totalCartoes: baralho.cartoes.length,
      cartoesRevisados: baralho.cartoes.filter((cartao) => cartao.revisoes.length > 0).length,
      retencaoPorcentagem: revisoes.length === 0 ? 0 : (acertos / revisoes.length) * 100,
    };
  }
}
