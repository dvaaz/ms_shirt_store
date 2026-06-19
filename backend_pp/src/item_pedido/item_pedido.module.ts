import { Module } from '@nestjs/common';
import { ItemPedidoService } from './item_pedido.service';
import { ItemPedidoController } from './item_pedido.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Module({
  controllers: [ItemPedidoController],
  providers: [ItemPedidoService, PrismaService],
  exports: [ItemPedidoService],
})
export class ItemPedidoModule {}
