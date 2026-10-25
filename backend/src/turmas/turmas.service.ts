import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CriarTurmaDto } from './dtos/criar-turma.dto.js';

@Injectable()
export class TurmasService {
  constructor(private readonly prisma: PrismaService) {}

  async criarTurma(dto: CriarTurmaDto) {
    try {
      return await this.prisma.turma.create({
        data: {
          nome: dto.nome,
          descricao: dto.descricao,
          codigo: dto.codigo,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Já existe uma turma com este código.');
      }
      throw error;
    }
  }

  async listarMinhasTurmas(usuarioId: string) {
    const turmasDoUsuario = await this.prisma.turmaUsuario.findMany({
      where: { usuarioId },
      include: {
        turma: {
          include: {
            _count: {
              select: {
                membros: true,
                baralhos: true,
              },
            },
          },
        },
      },
      orderBy: { entrouEm: 'desc' },
    });

    return turmasDoUsuario.map((item) => ({
      id: item.turma.id,
      nome: item.turma.nome,
      descricao: item.turma.descricao,
      codigo: item.turma.codigo,
      totalMembros: item.turma._count.membros,
      totalBaralhos: item.turma._count.baralhos,
      entrouEm: item.entrouEm,
    }));
  }

  async entrarNaTurma(usuarioId: string, codigo: string) {
    const turma = await this.prisma.turma.findUnique({
      where: { codigo },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada com este código.');
    }

    try {
      return await this.prisma.turmaUsuario.create({
        data: {
          usuarioId,
          turmaId: turma.id,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Você já faz parte desta turma.');
      }
      throw error;
    }
  }
}
