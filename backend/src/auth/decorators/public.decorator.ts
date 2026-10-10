import { SetMetadata } from '@nestjs/common';

// A chave que o JwtAuthGuard procura nos metadados do handler/controller.
export const IS_PUBLIC_KEY = 'isPublic';

// Marca uma rota como isenta de autenticação. Sem isto, o JwtAuthGuard
// global exige token em TODA rota — proteger por padrão e abrir uma exceção
// explícita é mais seguro do que o inverso: esquecer de proteger uma rota
// nova é o erro comum; esquecer de marcar uma rota como pública é só um
// 401 a mais durante o desenvolvimento, fácil de perceber e corrigir.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
