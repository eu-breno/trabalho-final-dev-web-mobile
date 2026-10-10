import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { BaralhosModule } from './baralhos/baralhos.module.js';
import { CartoesModule } from './cartoes/cartoes.module.js';
import { EstatisticasModule } from './estatisticas/estatisticas.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    BaralhosModule,
    CartoesModule,
    EstatisticasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
