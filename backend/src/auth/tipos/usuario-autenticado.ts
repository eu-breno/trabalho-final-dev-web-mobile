import type { Request } from 'express';
import { Perfil } from '../../../generated/prisma/enums.js';


// O que sobra do Usuario depois do login: nunca a senhaHash. É este objeto
// que o JwtStrategy devolve, o JwtAuthGuard anexa a request.user, e o
// PapeisGuard e @UsuarioAtual() leem.
export interface UsuarioAutenticado {
  id: string;
  perfil: Perfil;
}

// A mesma técnica de tipagem explícita do Request usada em
// http-exception.filter.ts (aula 6), só que estendida com o campo que o
// Passport acrescenta depois que o JwtAuthGuard autentica a requisição.
export interface RequisicaoAutenticada extends Request {
  user?: UsuarioAutenticado;
}
