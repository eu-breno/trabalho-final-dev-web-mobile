import {Body, Controller, Delete, Get, Param, Patch, Post,} from '@nestjs/common';
import { BaralhosService } from './baralhos.service.js';
import { UpdateBaralhoDTO } from './dtos/update-baralho.dto.js';
import {CreateBaralhoDTO} from "./dtos/create-baralho.dto.js";

@Controller('baralhos')
export class BaralhosController {
  constructor(private readonly baralhosService: BaralhosService) {}

  // GET /baralhos -> Lista os baralhos do usuário
  @Get()
  async listarTodos() {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.baralhosService.listarTodos(usuarioIdDummy);
  }

  // GET /baralhos/:id -> Obtém um baralho
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.baralhosService.buscarPorId(id);
  }

  // POST /baralhos -> Cria baralho
  @Post()
  async criar(@Body() dto: CreateBaralhoDTO) {
    const usuarioIdDummy = 'id-do-usuario-logado';
    return this.baralhosService.criar(dto, usuarioIdDummy);
  }

  // PATCH /baralhos/:id -> Edita baralho
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: UpdateBaralhoDTO) {
    return this.baralhosService.atualizar(id, dto);
  }

  // DELETE /baralhos/:id -> Remove baralho (e seus cartões)
  @Delete(':id')
  async remover(@Param('id') id: string) {
    return this.baralhosService.remover(id);
  }

  // GET /baralhos/:baralhoId/cartoes -> Lista cartões de um baralho
  @Get(':baralhoId/cartoes')
  async listarCartoesDoBaralho(@Param('baralhoId') baralhoId: string) {
    return this.baralhosService.listarCartoesDoBaralho(baralhoId);
  }

  // POST /baralhos/:baralhoId/cartoes -> Cria cartão no baralho
  @Post(':baralhoId/cartoes')
  async criarCartaoNoBaralho(
    @Param('baralhoId') baralhoId: string,
    @Body() body: any,
  ) {
    return this.baralhosService.criarCartaoNoBaralho(baralhoId, body);
  }

  // GET /baralhos/:id/estudo -> Fila de cartões pendentes
  @Get(':id/estudo')
  async obterFilaEstudo(@Param('id') id: string) {
    return this.baralhosService.obterFilaEstudo(id);
  }
}
