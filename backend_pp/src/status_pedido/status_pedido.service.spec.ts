import { Test, TestingModule } from '@nestjs/testing';
import { StatusPedidoService } from './status_pedido.service';

describe('StatusPedidoService', () => {
  let service: StatusPedidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusPedidoService],
    }).compile();

    service = module.get<StatusPedidoService>(StatusPedidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
