import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListarUsuariosDto } from './dtos/listar-usuarios.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

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
}
