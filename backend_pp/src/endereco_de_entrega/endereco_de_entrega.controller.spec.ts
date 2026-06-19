import { Test, TestingModule } from '@nestjs/testing';
import { EnderecoDeEntregaController } from './endereco_de_entrega.controller';
import { EnderecoDeEntregaService } from './endereco_de_entrega.service';

describe('EnderecoDeEntregaController', () => {
  let controller: EnderecoDeEntregaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnderecoDeEntregaController],
      providers: [EnderecoDeEntregaService],
    }).compile();

    controller = module.get<EnderecoDeEntregaController>(
      EnderecoDeEntregaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
