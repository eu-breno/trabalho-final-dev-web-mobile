import { Module } from '@nestjs/common';
import { CartoesController } from './cartoes.controller.js';
import { CartoesService } from './cartoes.service.js';

@Module({
  controllers: [CartoesController],
  providers: [CartoesService],
  exports: [CartoesService],
})
export class CartoesModule {}
