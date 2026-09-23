import { Module } from '@nestjs/common';
import { BaralhosController } from './baralhos.controller.js';
import { BaralhosService } from './baralhos.service.js';

@Module({
  controllers: [BaralhosController],
  providers: [BaralhosService],
  exports: [BaralhosService],
})
export class BaralhosModule {}
