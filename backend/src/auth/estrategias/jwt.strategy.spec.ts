import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import { Perfil } from '../../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const config = new ConfigService({ JWT_SECRET: 'test-secret' });

  it('usa o perfil atual do banco e ignora o perfil antigo do token', async () => {
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'usuario-id',
          perfil: Perfil.administrador,
        }),
      },
    } as unknown as PrismaService;
    const strategy = new JwtStrategy(config, prisma);

    await expect(
      strategy.validate({ sub: 'usuario-id', perfil: Perfil.estudante }),
    ).resolves.toEqual({ id: 'usuario-id', perfil: Perfil.administrador });
  });

  it('rejeita um token cujo usuário já não existe', async () => {
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const strategy = new JwtStrategy(config, prisma);

    await expect(strategy.validate({ sub: 'excluido-id' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
