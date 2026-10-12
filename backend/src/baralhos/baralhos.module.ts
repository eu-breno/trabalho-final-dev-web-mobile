import { Module } from '@nestjs/common';
import { BaralhosController } from './baralhos.controller.js';
import { BaralhosService } from './baralhos.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [BaralhosController],
  providers: [BaralhosService],
  exports: [BaralhosService],
})
export class BaralhosModule {}
