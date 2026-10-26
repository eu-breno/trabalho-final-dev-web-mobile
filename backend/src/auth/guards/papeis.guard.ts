import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '../../../generated/prisma/client.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { RequisicaoAutenticada } from '../tipos/usuario-autenticado.js';

@Injectable()
export class PapeisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const papeisNecessarios = this.reflector.getAllAndOverride<Perfil[]>(
      ROLES_KEY,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (!papeisNecessarios || papeisNecessarios.length === 0) {
      return true;
    }

    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    const usuario = requisicao.user;

    return !!usuario && papeisNecessarios.includes(usuario.perfil);
  }
}
