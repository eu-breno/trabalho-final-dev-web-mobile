import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura', // Chave para assinar o token
      signOptions: { expiresIn: '1d' }, // Tempo deexpiração do token (ex: 1 dia)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
