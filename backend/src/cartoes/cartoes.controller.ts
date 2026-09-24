import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CartoesService } from './cartoes.service.js';
import { CreateCartaoDTO } from './dtos/create-cartao.dto.js';
import { UpdateCartaoDTO } from './dtos/update-cartao.dto.js';
import { CreateRevisaoDTO } from './dtos/create-revisao.dto.js';
import { DEV_USER_ID } from '../common/dev-user.js';

@Controller('cartoes')
export class CartoesController {
  constructor(private readonly cartoesService: CartoesService) {}

  // POST /cartoes -> Cria um novo cartão diretamente
  @Post()
  async criar(@Body() dto: CreateCartaoDTO) {
    return this.cartoesService.criar(dto, DEV_USER_ID);
  }

  // GET /cartoes/:id -> Obtém um cartão
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.cartoesService.buscarPorId(id, DEV_USER_ID);
  }

  // PATCH /cartoes/:id -> Edita frente/verso
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: UpdateCartaoDTO) {
    return this.cartoesService.atualizar(id, dto, DEV_USER_ID);
  }

  // DELETE /cartoes/:id -> Remove cartão
  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id') id: string) {
    return this.cartoesService.remover(id, DEV_USER_ID);
  }

  // POST /cartoes/:id/revisoes -> Registra avaliação e reagenda o cartão
  @Post(':id/revisoes')
  async registrarRevisao(
    @Param('id') id: string,
    @Body() dto: CreateRevisaoDTO,
  ) {
    return this.cartoesService.registrarRevisao(id, dto, DEV_USER_ID);
  }
}
