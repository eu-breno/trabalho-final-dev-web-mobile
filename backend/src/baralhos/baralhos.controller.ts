import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BaralhosService } from './baralhos.service.js';
import { UpdateBaralhoDTO } from './dtos/update-baralho.dto.js';
import { CreateBaralhoDTO } from './dtos/create-baralho.dto.js';
import { ObterFilaEstudoDTO } from './dtos/obter-fila-estudo.dto.js';
import { CreateCartaoDTO } from '../cartoes/dtos/create-cartao.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';

@Controller('baralhos')
@UseGuards(JwtAuthGuard)
export class BaralhosController {
  constructor(private readonly baralhosService: BaralhosService) {}

  @Get()
  async listarTodos(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.baralhosService.listarTodos(usuario.id);
  }

  @Get('estudo')
  async obterFilaEstudoGlobal(
    @Query() query: ObterFilaEstudoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.baralhosService.obterFilaEstudoGlobal(usuario.id, query);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.baralhosService.buscarPorId(id, usuario.id);
  }

  @Post()
  async criar(@Body() dto: CreateBaralhoDTO, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.baralhosService.criar(dto, usuario.id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateBaralhoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.baralhosService.atualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id') id: string, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.baralhosService.remover(id, usuario.id);
  }

  @Get(':baralhoId/cartoes')
  async listarCartoesDoBaralho(
    @Param('baralhoId') baralhoId: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.baralhosService.listarCartoesDoBaralho(baralhoId, usuario.id);
  }

  @Post(':baralhoId/cartoes')
  async criarCartaoNoBaralho(
    @Param('baralhoId') baralhoId: string,
    @Body() body: CreateCartaoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.baralhosService.criarCartaoNoBaralho(baralhoId, body, usuario.id);
  }

  @Get(':id/estudo')
  async obterFilaEstudo(
    @Param('id') id: string,
    @Query() query: ObterFilaEstudoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.baralhosService.obterFilaEstudo(id, usuario.id, query);
  }
}
