import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCartaoDTO } from '../cartoes/dtos/create-cartao.dto.js';
import { CreateBaralhoDTO } from './dtos/create-baralho.dto.js';
import { UpdateBaralhoDTO } from './dtos/update-baralho.dto.js';

@Injectable()
export class BaralhosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarTodos(usuarioId: string) {
    const baralhos = await this.prisma.baralho.findMany({
      where: { usuarioId },
      orderBy: { nome: 'asc' },
      include: { cartoes: { select: { proximaRevisao: true } } },
    });

    return baralhos.map(({ cartoes, ...baralho }) => ({
      ...baralho,
      totalCartoes: cartoes.length,
      cartoesPendentes: cartoes.filter((cartao) => cartao.proximaRevisao <= new Date()).length,
    }));
  }

  async buscarPorId(id: string, usuarioId: string) {
    const baralho = await this.prisma.baralho.findFirst({
      where: { id, usuarioId },
      include: { cartoes: { select: { proximaRevisao: true } } },
    });
    if (!baralho) throw new NotFoundException('Baralho não encontrado');

    const { cartoes, ...dados } = baralho;
    return {
      ...dados,
      totalCartoes: cartoes.length,
      cartoesPendentes: cartoes.filter((cartao) => cartao.proximaRevisao <= new Date()).length,
    };
  }

  async criar(dto: CreateBaralhoDTO, usuarioId: string) {
    try {
      const baralho = await this.prisma.baralho.create({ data: { ...dto, usuarioId } });
      return this.buscarPorId(baralho.id, usuarioId);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Já existe um baralho com esse nome');
      }
      throw error;
    }
  }

  async atualizar(id: string, dto: UpdateBaralhoDTO, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    try {
      await this.prisma.baralho.update({ where: { id }, data: dto });
      return this.buscarPorId(id, usuarioId);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Já existe um baralho com esse nome');
      }
      throw error;
    }
  }

  async remover(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    await this.prisma.baralho.delete({ where: { id } });
  }

  async listarCartoesDoBaralho(baralhoId: string, usuarioId: string) {
    await this.buscarPorId(baralhoId, usuarioId);
    return this.prisma.cartao.findMany({
      where: { baralhoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async criarCartaoNoBaralho(baralhoId: string, dadosCartao: CreateCartaoDTO, usuarioId: string) {
    await this.buscarPorId(baralhoId, usuarioId);
    return this.prisma.cartao.create({
      data: { frente: dadosCartao.frente, verso: dadosCartao.verso, baralhoId },
    });
  }

  async obterFilaEstudo(baralhoId: string, usuarioId: string) {
    await this.buscarPorId(baralhoId, usuarioId);
    return this.prisma.cartao.findMany({
      where: { baralhoId, proximaRevisao: { lte: new Date() } },
      orderBy: { proximaRevisao: 'asc' },
      take: 20,
    });
  }
}
