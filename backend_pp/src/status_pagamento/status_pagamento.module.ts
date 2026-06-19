import { Module } from '@nestjs/common';
import { StatusPagamentoService } from './status_pagamento.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StatusPagamentoController } from './status_pagamento.controller';

@Module({
  controllers: [StatusPagamentoController],
  providers: [StatusPagamentoService, PrismaService],
  exports: [StatusPagamentoService],
})
export class StatusPagamentoModule {}
