import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  RequisicaoAutenticada,
  UsuarioAutenticado,
} from '../tipos/usuario-autenticado.js';


// Extensão de @Param()/@Query() (aula 5): um parameter decorator próprio
// que lê o que o JwtAuthGuard anexou em request.user. Sem ele, cada
// controller que precisasse do usuário logado repetiria
// `@Req() req: Request` e o cast manual do tipo.
export const UsuarioAtual = createParamDecorator(
  (
    _dado: unknown,
    contexto: ExecutionContext,
  ): UsuarioAutenticado | undefined => {
    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    return requisicao.user;
  },
);
