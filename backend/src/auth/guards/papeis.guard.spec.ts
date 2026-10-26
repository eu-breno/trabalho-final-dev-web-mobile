import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '../../../generated/prisma/enums.js';
import { Roles } from '../decorators/roles.decorator.js';
import { PapeisGuard } from './papeis.guard.js';

class EndpointAdministrativo {
  @Roles('administrador')
  executar() {}
}

function contexto(perfil?: Perfil): ExecutionContext {
  return {
    getHandler: () => EndpointAdministrativo.prototype.executar,
    getClass: () => EndpointAdministrativo,
    switchToHttp: () => ({
      getRequest: () => ({
        user: perfil ? { id: 'usuario-id', perfil } : undefined,
      }),
    }),
  } as ExecutionContext;
}

describe('PapeisGuard', () => {
  const guard = new PapeisGuard(new Reflector());

  it('permite o perfil administrador declarado no metadata', () => {
    expect(guard.canActivate(contexto(Perfil.administrador))).toBe(true);
  });

  it('nega o acesso de um estudante', () => {
    expect(guard.canActivate(contexto(Perfil.estudante))).toBe(false);
  });
});
