import { Test, TestingModule } from '@nestjs/testing';
import { MetodosDePagamentoService } from './metodos_de_pagamento.service';

describe('MetodosDePagamentoService', () => {
  let service: MetodosDePagamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetodosDePagamentoService],
    }).compile();

    service = module.get<MetodosDePagamentoService>(MetodosDePagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
