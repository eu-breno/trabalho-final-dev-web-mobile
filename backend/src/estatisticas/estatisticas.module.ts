import { Module } from '@nestjs/common';
import { EstatisticasController } from './estatisticas.controller.js';
import { EstatisticasService } from './estatisticas.service.js';

@Module({
  controllers: [EstatisticasController],
  providers: [EstatisticasService],
  exports: [EstatisticasService],
})
export class EstatisticasModule {}
