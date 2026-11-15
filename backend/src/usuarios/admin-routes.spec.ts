import { describe, expect, it, vi } from 'vitest';
import { Perfil } from '../../generated/prisma/enums.js';
import { BaralhosController } from '../baralhos/baralhos.controller.js';
import { BaralhosService } from '../baralhos/baralhos.service.js';
import { FiltroAtividadeDTO } from '../estatisticas/dtos/filtro-atividade.dto.js';
import { FiltroEstatisticasDTO } from '../estatisticas/dtos/filtro-estatisticas.dto.js';
import { EstatisticasController } from '../estatisticas/estatisticas.controller.js';
import { EstatisticasService } from '../estatisticas/estatisticas.service.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';

describe('rotas existentes de dados do próprio usuário', () => {
  const usuario: UsuarioAutenticado = {
    id: 'usuario-logado',
    perfil: Perfil.estudante,
  };

  it('mantém as estatísticas gerais, atividade e métricas por baralho no escopo do token', async () => {
    const service = {
      obterGerais: vi.fn().mockResolvedValue({}),
      obterAtividade: vi.fn().mockResolvedValue([]),
      obterPorBaralho: vi.fn().mockResolvedValue({}),
    };
    const controller = new EstatisticasController(
      service as unknown as EstatisticasService,
    );
    const filtroEstatisticas = new FiltroEstatisticasDTO();
    const filtroAtividade = new FiltroAtividadeDTO();

    await controller.obterGerais(filtroEstatisticas, usuario);
    await controller.obterAtividade(filtroAtividade, usuario);
    await controller.obterPorBaralho('baralho-id', usuario);

    expect(service.obterGerais).toHaveBeenCalledWith(
      usuario.id,
      filtroEstatisticas,
    );
    expect(service.obterAtividade).toHaveBeenCalledWith(usuario.id, 7);
    expect(service.obterPorBaralho).toHaveBeenCalledWith(
      'baralho-id',
      usuario.id,
    );
  });

  it('mantém a listagem de baralhos no escopo do token', async () => {
    const service = {
      listarTodos: vi.fn().mockResolvedValue([]),
    };
    const controller = new BaralhosController(
      service as unknown as BaralhosService,
    );

    await controller.listarTodos(usuario);

    expect(service.listarTodos).toHaveBeenCalledWith(usuario.id);
  });
});
