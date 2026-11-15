import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../../generated/prisma/client.js';
import { BaralhosService } from '../baralhos/baralhos.service.js';
import { EstatisticasService } from '../estatisticas/estatisticas.service.js';
import { FiltroAtividadeDTO } from '../estatisticas/dtos/filtro-atividade.dto.js';
import { FiltroEstatisticasDTO } from '../estatisticas/dtos/filtro-estatisticas.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListarUsuariosDto } from './dtos/listar-usuarios.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly baralhosService: BaralhosService,
    private readonly estatisticasService: EstatisticasService,
  ) {}

  async listar({ page, limit }: ListarUsuariosDto) {
    const [dados, total] = await Promise.all([
      this.prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.usuario.count(),
    ]);

    return { dados, total, page, limit };
  }

  async excluir(id: string, administradorId: string, senha: string): Promise<void> {
    const administrador = await this.prisma.usuario.findUnique({
      where: { id: administradorId },
      select: { senhaHash: true },
    });

    if (!administrador) {
      throw new UnauthorizedException('Administrador autenticado não encontrado');
    }

    if (!(await bcrypt.compare(senha, administrador.senhaHash))) {
      throw new ForbiddenException('Senha de confirmação incorreta');
    }

    if (id === administradorId) {
      throw new ConflictException('Não é permitido excluir a própria conta');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    try {
      await this.prisma.usuario.delete({ where: { id } });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2025'
      ) {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw erro;
    }
  }

  async obterDetalhe(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const [totalBaralhos, totalCartoes, cartoesPendentes] = await Promise.all([
      this.prisma.baralho.count({ where: { usuarioId: id } }),
      this.prisma.cartao.count({ where: { baralho: { usuarioId: id } } }),
      this.prisma.cartao.count({
        where: {
          baralho: { usuarioId: id },
          proximaRevisao: { lte: new Date() },
        },
      }),
    ]);

    return { ...usuario, totalBaralhos, totalCartoes, cartoesPendentes };
  }

  async obterEstatisticas(id: string, filtro: FiltroEstatisticasDTO) {
    await this.garantirUsuarioExiste(id);
    return this.estatisticasService.obterGerais(id, filtro);
  }

  async obterAtividade(id: string, filtro: FiltroAtividadeDTO) {
    await this.garantirUsuarioExiste(id);
    return this.estatisticasService.obterAtividade(id, filtro.dias);
  }

  async listarBaralhos(id: string) {
    await this.garantirUsuarioExiste(id);
    const baralhos = await this.baralhosService.listarTodos(id);
    const metricas = await Promise.all(
      baralhos.map((baralho) =>
        this.estatisticasService.obterPorBaralho(baralho.id, id),
      ),
    );

    return baralhos.map((baralho, indice) => ({
      ...baralho,
      cartoesRevisados: metricas[indice].cartoesRevisados,
      retencaoPorcentagem: metricas[indice].retencaoPorcentagem,
    }));
  }

  private async garantirUsuarioExiste(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }
}
