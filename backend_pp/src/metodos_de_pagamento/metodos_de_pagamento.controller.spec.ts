import { Test, TestingModule } from '@nestjs/testing';
import { MetodosDePagamentoController } from './metodos_de_pagamento.controller';
import { MetodosDePagamentoService } from './metodos_de_pagamento.service';

describe('MetodosDePagamentoController', () => {
  let controller: MetodosDePagamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetodosDePagamentoController],
      providers: [MetodosDePagamentoService],
    }).compile();

    controller = module.get<MetodosDePagamentoController>(
      MetodosDePagamentoController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
