import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateBaralhoDTO } from './dtos/create-baralho.dto.js';
import { UpdateBaralhoDTO } from './dtos/update-baralho.dto.js';

// Define a estrutura do baralho
export interface Baralho {
  id: string;
  titulo: string;
  descricao?: string;
  usuarioId: string;
}

@Injectable()
export class BaralhosService {
  // Tipando o array explicitamente para evitar o erro 'never'
  private baralhos: Baralho[] = [];

  async listarTodos(usuarioId: string): Promise<Baralho[]> {
    return this.baralhos;
  }

  async buscarPorId(id: string): Promise<Baralho> {
    const baralho = this.baralhos.find((b) => b.id === id);
    if (!baralho) {
      throw new NotFoundException(`Baralho com ID ${id} não encontrado`);
    }
    return baralho;
  }

  async criar(dto: CreateBaralhoDTO, usuarioId: string): Promise<Baralho> {
    const novoBaralho: Baralho = {
      id: randomUUID(),
      ...dto,
      usuarioId,
    };
    this.baralhos.push(novoBaralho);
    return novoBaralho;
  }

  async atualizar(id: string, dto: UpdateBaralhoDTO): Promise<Baralho> {
    const baralho = await this.buscarPorId(id);
    Object.assign(baralho, dto);
    return baralho;
  }

  async remover(id: string): Promise<{ message: string }> {
    const index = this.baralhos.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new NotFoundException(`Baralho com ID ${id} não encontrado`);
    }
    this.baralhos.splice(index, 1);
    return { message: 'Baralho e seus cartões associados foram removidos' };
  }

  async listarCartoesDoBaralho(baralhoId: string) {
    await this.buscarPorId(baralhoId);
    return [];
  }

  async criarCartaoNoBaralho(baralhoId: string, dadosCartao: any) {
    await this.buscarPorId(baralhoId);
    return {
      id: randomUUID(),
      baralhoId,
      ...dadosCartao,
    };
  }

  async obterFilaEstudo(baralhoId: string) {
    await this.buscarPorId(baralhoId);
    return [];
  }
}
