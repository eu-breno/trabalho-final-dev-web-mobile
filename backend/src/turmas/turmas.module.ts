import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TurmasController } from './turmas.controller.js';
import { TurmasService } from './turmas.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
