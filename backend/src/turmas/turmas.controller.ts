import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CriarTurmaDto } from './dtos/criar-turma.dto.js';
import { TurmasService } from './turmas.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/tipos/usuario-autenticado.js';


@Controller('turmas')
@UseGuards(JwtAuthGuard)
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post('criar_turma')
  async criar(@Body() criarTurmaDto: CriarTurmaDto) {
    return this.turmasService.criarTurma(criarTurmaDto);
  }

  @Post('entrar')
  async entrar(
    @Body('codigo') codigo: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ) {
    return this.turmasService.entrarNaTurma(usuario.id, codigo);
  }

  @Get()
  async listarMinhasTurmas(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return this.turmasService.listarMinhasTurmas(usuario.id);
  }
}
