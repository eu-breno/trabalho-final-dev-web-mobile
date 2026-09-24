import { Body, Controller, Delete, Get, Param, Patch, Post, } from '@nestjs/common';
import { CartoesService } from './cartoes.service.js';
import { CreateCartaoDTO } from './dtos/create-cartao.dto.js';
import { UpdateCartaoDTO } from './dtos/update-cartao.dto.js';
import { CreateRevisaoDTO } from './dtos/create-revisao.dto.js';

@Controller('cartoes')
export class CartoesController {
  constructor(private readonly cartoesService: CartoesService) {}

  // POST /cartoes -> Cria um novo cartão diretamente
  @Post()
  async criar(@Body() dto: CreateCartaoDTO) {
    return this.cartoesService.criar(dto);
  }

  // GET /cartoes/:id -> Obtém um cartão
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.cartoesService.buscarPorId(id);
  }

  // PATCH /cartoes/:id -> Edita frente/verso
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: UpdateCartaoDTO) {
    return this.cartoesService.atualizar(id, dto);
  }

  // DELETE /cartoes/:id -> Remove cartão
  @Delete(':id')
  async remover(@Param('id') id: string) {
    return this.cartoesService.remover(id);
  }

  // POST /cartoes/:id/revisoes -> Registra avaliação e reagenda o cartão
  @Post(':id/revisoes')
  async registrarRevisao(
    @Param('id') id: string,
    @Body() dto: CreateRevisaoDTO,
  ) {
    return this.cartoesService.registrarRevisao(id, dto);
  }
}
