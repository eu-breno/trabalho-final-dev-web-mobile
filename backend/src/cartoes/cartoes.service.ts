import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCartaoDTO } from './dtos/create-cartao.dto.js';
import { UpdateCartaoDTO } from './dtos/update-cartao.dto.js';
import { CreateRevisaoDTO } from './dtos/create-revisao.dto.js';

export interface Cartao {
  id: string;
  frente: string;
  verso: string;
  baralhoId: string;
  criadoEm: Date;
  proximaRevisao?: Date;
  intervaloDias?: number;
}

@Injectable()
export class CartoesService {
  private cartoes: Cartao[] = [];

  async criar(dto: CreateCartaoDTO): Promise<Cartao> {
    const novoCartao: Cartao = {
      id: randomUUID(),
      ...dto,
      criadoEm: new Date(),
    };
    this.cartoes.push(novoCartao);
    return novoCartao;
  }

  async buscarPorId(id: string): Promise<Cartao> {
    const cartao = this.cartoes.find((c) => c.id === id);
    if (!cartao) {
      throw new NotFoundException(`Cartão com ID ${id} não encontrado`);
    }
    return cartao;
  }

  async atualizar(id: string, dto: UpdateCartaoDTO): Promise<Cartao> {
    const cartao = await this.buscarPorId(id);
    Object.assign(cartao, dto);
    return cartao;
  }

  async remover(id: string): Promise<{ message: string }> {
    const index = this.cartoes.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Cartão com ID ${id} não encontrado`);
    }
    this.cartoes.splice(index, 1);
    return { message: 'Cartão removido com sucesso' };
  }

  async registrarRevisao(id: string, dto: CreateRevisaoDTO) {
    const cartao = await this.buscarPorId(id);

    // Lógica simplificada de reagendamento baseada na nota
    const diasParaAdicionar = dto.nota * 2;
    const proximaData = new Date();
    proximaData.setDate(proximaData.getDate() + diasParaAdicionar);

    cartao.proximaRevisao = proximaData;
    cartao.intervaloDias = diasParaAdicionar;

    return {
      message: 'Avaliação registrada e cartão reagendado com sucesso',
      cartaoId: cartao.id,
      nota: dto.nota,
      proximaRevisao: cartao.proximaRevisao,
    };
  }
}
