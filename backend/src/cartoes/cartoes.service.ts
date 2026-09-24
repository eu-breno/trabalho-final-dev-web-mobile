import { Injectable, NotFoundException } from '@nestjs/common';
import { Nota } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCartaoDTO } from './dtos/create-cartao.dto.js';
import { UpdateCartaoDTO } from './dtos/update-cartao.dto.js';
import { CreateRevisaoDTO } from './dtos/create-revisao.dto.js';

@Injectable()
export class CartoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateCartaoDTO, usuarioId: string) {
    if (!dto.baralhoId) throw new NotFoundException('Informe o baralho do cartão');
    await this.buscarBaralho(dto.baralhoId, usuarioId);
    return this.prisma.cartao.create({
      data: { frente: dto.frente, verso: dto.verso, baralhoId: dto.baralhoId },
    });
  }

  private async buscarBaralho(id: string, usuarioId: string) {
    const baralho = await this.prisma.baralho.findFirst({ where: { id, usuarioId } });
    if (!baralho) throw new NotFoundException('Baralho não encontrado');
    return baralho;
  }

  async buscarPorId(id: string, usuarioId: string) {
    const cartao = await this.prisma.cartao.findFirst({
      where: { id, baralho: { usuarioId } },
    });
    if (!cartao) throw new NotFoundException('Cartão não encontrado');
    return cartao;
  }

  async atualizar(id: string, dto: UpdateCartaoDTO, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    return this.prisma.cartao.update({
      where: { id },
      data: { frente: dto.frente, verso: dto.verso },
    });
  }

  async remover(id: string, usuarioId: string) {
    await this.buscarPorId(id, usuarioId);
    await this.prisma.cartao.delete({ where: { id } });
  }

  async registrarRevisao(id: string, dto: CreateRevisaoDTO, usuarioId: string) {
    const cartao = await this.buscarPorId(id, usuarioId);
    const intervalos = { errei: 0, dificil: 1, bom: 3, facil: 7 };
    const intervaloNovoDias = intervalos[dto.nota];
    const proximaRevisao = new Date();
    proximaRevisao.setDate(proximaRevisao.getDate() + intervaloNovoDias);

    return this.prisma.$transaction(async (transaction) => {
      const atualizado = await transaction.cartao.update({
        where: { id: cartao.id },
        data: {
          intervaloDias: intervaloNovoDias,
          repeticoes: { increment: 1 },
          proximaRevisao,
          ultimaRevisao: new Date(),
        },
      });
      await transaction.revisao.create({
        data: {
          cartaoId: cartao.id,
          nota: dto.nota as Nota,
          intervaloAnteriorDias: cartao.intervaloDias,
          intervaloNovoDias,
        },
      });
      return atualizado;
    });
  }
}
