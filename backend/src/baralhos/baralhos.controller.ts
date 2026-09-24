import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { BaralhosService } from './baralhos.service.js';
import { UpdateBaralhoDTO } from './dtos/update-baralho.dto.js';
import { CreateBaralhoDTO } from './dtos/create-baralho.dto.js';
import { CreateCartaoDTO } from '../cartoes/dtos/create-cartao.dto.js';
import { DEV_USER_ID } from '../common/dev-user.js';

@Controller('baralhos')
export class BaralhosController {
  constructor(private readonly baralhosService: BaralhosService) {}

  // GET /baralhos -> Lista os baralhos do usuário
  @Get()
  async listarTodos() {
    return this.baralhosService.listarTodos(DEV_USER_ID);
  }

  // GET /baralhos/:id -> Obtém um baralho
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.baralhosService.buscarPorId(id, DEV_USER_ID);
  }

  // POST /baralhos -> Cria baralho
  @Post()
  async criar(@Body() dto: CreateBaralhoDTO) {
    return this.baralhosService.criar(dto, DEV_USER_ID);
  }

  // PATCH /baralhos/:id -> Edita baralho
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: UpdateBaralhoDTO) {
    return this.baralhosService.atualizar(id, dto, DEV_USER_ID);
  }

  // DELETE /baralhos/:id -> Remove baralho (e seus cartões)
  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id') id: string) {
    return this.baralhosService.remover(id, DEV_USER_ID);
  }

  // GET /baralhos/:baralhoId/cartoes -> Lista cartões de um baralho
  @Get(':baralhoId/cartoes')
  async listarCartoesDoBaralho(@Param('baralhoId') baralhoId: string) {
    return this.baralhosService.listarCartoesDoBaralho(baralhoId, DEV_USER_ID);
  }

  // POST /baralhos/:baralhoId/cartoes -> Cria cartão no baralho
  @Post(':baralhoId/cartoes')
  async criarCartaoNoBaralho(
    @Param('baralhoId') baralhoId: string,
    @Body() body: CreateCartaoDTO,
  ) {
    return this.baralhosService.criarCartaoNoBaralho(baralhoId, body, DEV_USER_ID);
  }

  // GET /baralhos/:id/estudo -> Fila de cartões pendentes
  @Get(':id/estudo')
  async obterFilaEstudo(@Param('id') id: string) {
    return this.baralhosService.obterFilaEstudo(id, DEV_USER_ID);
  }
}
