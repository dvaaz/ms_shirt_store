import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { MetodosDePagamentoService } from './metodos_de_pagamento/metodos_de_pagamento.service';
import { MetodosDePagamentoController } from './metodos_de_pagamento/metodos_de_pagamento.controller';
import { MetodosDePagamentoModule } from './metodos_de_pagamento/metodos_de_pagamento.module';
import { StatusPagamentoService } from './status_pagamento/status_pagamento.service';
import { StatusPagamentoController } from './status_pagamento/status_pagamento.controller';
import { StatusPedidoController } from './status_pedido/status_pedido.controller';
import { StatusPedidoService } from './status_pedido/status_pedido.service';
import { StatusPedidoModule } from './status_pedido/status_pedido.module';
import { StatusPagamentoModule } from './status_pagamento/status_pagamento.module';
import { EnderecoDeEntregaModule } from './endereco_de_entrega/endereco_de_entrega.module';
import { PedidoModule } from './pedido/pedido.module';
import { ItemPedidoModule } from './item_pedido/item_pedido.module';
import { PagamentoModule } from './pagamento/pagamento.module';

@Module({
  imports: [
    PrismaModule,
    MetodosDePagamentoModule,
    StatusPedidoModule,
    StatusPagamentoModule,
    EnderecoDeEntregaModule,
    PedidoModule,
    ItemPedidoModule,
    PagamentoModule,
  ],
  controllers: [
    AppController,
    MetodosDePagamentoController,
    StatusPagamentoController,
    StatusPedidoController,
  ],
  providers: [
    AppService,
    MetodosDePagamentoService,
    StatusPagamentoService,
    StatusPedidoService,
  ],
})
export class AppModule {}
