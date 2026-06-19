import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PagamentoController } from './pagamento.controller';
import { PagamentoService } from './pagamento.service';
import { MetodosDePagamentoModule } from '../metodos_de_pagamento/metodos_de_pagamento.module';
import { StatusPagamentoModule } from '../status_pagamento/status_pagamento.module';

@Module({
  imports: [MetodosDePagamentoModule, StatusPagamentoModule],
  controllers: [PagamentoController],
  providers: [PagamentoService, PrismaService],
})
export class PagamentoModule {}
