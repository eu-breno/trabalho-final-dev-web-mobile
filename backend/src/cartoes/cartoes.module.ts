import { Module } from '@nestjs/common';
import { CartoesController } from './cartoes.controller.js';
import { CartoesService } from './cartoes.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CartoesController],
  providers: [CartoesService],
  exports: [CartoesService],
})
export class CartoesModule {}
