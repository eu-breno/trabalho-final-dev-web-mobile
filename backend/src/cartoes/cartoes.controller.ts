import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartoesService } from './cartoes.service.js';
import { CreateCartaoDTO } from './dtos/create-cartao.dto.js';
import { UpdateCartaoDTO } from './dtos/update-cartao.dto.js';
import { CreateRevisaoDTO } from './dtos/create-revisao.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';

@Controller('cartoes')
@UseGuards(JwtAuthGuard)
export class CartoesController {
  constructor(private readonly cartoesService: CartoesService) {}

  @Post()
  async criar(@Body() dto: CreateCartaoDTO, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cartoesService.criar(dto, usuario.id);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cartoesService.buscarPorId(id, usuario.id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateCartaoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.cartoesService.atualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id') id: string, @UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.cartoesService.remover(id, usuario.id);
  }

  @Post(':id/revisoes')
  async registrarRevisao(
    @Param('id') id: string,
    @Body() dto: CreateRevisaoDTO,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.cartoesService.registrarRevisao(id, dto, usuario.id);
  }
}
