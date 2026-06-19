import { Test, TestingModule } from '@nestjs/testing';
import { EnderecoDeEntregaService } from './endereco_de_entrega.service';

describe('EnderecoDeEntregaService', () => {
  let service: EnderecoDeEntregaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnderecoDeEntregaService],
    }).compile();

    service = module.get<EnderecoDeEntregaService>(EnderecoDeEntregaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
