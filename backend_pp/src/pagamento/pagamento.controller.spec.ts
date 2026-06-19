import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoController } from './pagamento.controller';
import { PagamentoService } from './pagamento.service';

describe('PagamentoController', () => {
  let controller: PagamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoController],
      providers: [
        {
          provide: PagamentoService,
          useValue: {
            create: jest.fn(),
            getStatusPagamento: jest.fn(),
            efetuarPagamento: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PagamentoController>(PagamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
