import { Module } from '@nestjs/common';
import { EstatisticasController } from './estatisticas.controller.js';
import { EstatisticasService } from './estatisticas.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EstatisticasController],
  providers: [EstatisticasService],
  exports: [EstatisticasService],
})
export class EstatisticasModule {}
