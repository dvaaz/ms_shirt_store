import { Module } from '@nestjs/common';
import { EnderecoDeEntregaService } from './endereco_de_entrega.service';
import { EnderecoDeEntregaController } from './endereco_de_entrega.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Module({
  controllers: [EnderecoDeEntregaController],
  providers: [EnderecoDeEntregaService, PrismaService],
  exports: [EnderecoDeEntregaService],
})
export class EnderecoDeEntregaModule {}
