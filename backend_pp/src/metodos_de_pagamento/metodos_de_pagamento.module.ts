import { Module } from '@nestjs/common';
import { MetodosDePagamentoService } from './metodos_de_pagamento.service';
import { MetodosDePagamentoController } from './metodos_de_pagamento.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Module({
  controllers: [MetodosDePagamentoController],
  providers: [MetodosDePagamentoService, PrismaService],
  exports: [MetodosDePagamentoService],
})
export class MetodosDePagamentoModule {}
