import { Test, TestingModule } from '@nestjs/testing';
import { StatusPedidoController } from './status_pedido.controller';

describe('StatusPedidoController', () => {
  let controller: StatusPedidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusPedidoController],
    }).compile();

    controller = module.get<StatusPedidoController>(StatusPedidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
