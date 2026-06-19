import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma/prisma.service';
import { PagamentoService } from './pagamento.service';

describe('PagamentoService', () => {
  let service: PagamentoService;
  let prisma: {
    pedido: { findUnique: jest.Mock };
    metodos_de_pagamento: { findUnique: jest.Mock };
    status_pagamento: { findFirst: jest.Mock };
    pagamento: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      pedido: { findUnique: jest.fn() },
      metodos_de_pagamento: { findUnique: jest.fn() },
      status_pagamento: { findFirst: jest.fn() },
      pagamento: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PagamentoService>(PagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create payment splitting cents in the first installment', async () => {
    prisma.pedido.findUnique.mockResolvedValue({
      pedido_uuid: 'pedido-1',
      pedido_valor_total: 1001,
      endereco_de_entrega_uuid: 'endereco-1',
      status_pedido: { status_pedido_nome: 'PENDENTE' },
    });
    prisma.metodos_de_pagamento.findUnique.mockResolvedValue({
      metodos_de_pagamento_id: 1,
      metodo_de_pagamento_nome: 'CARTAO_CREDITO',
    });
    prisma.status_pagamento.findFirst.mockResolvedValue({
      status_pagamento_id: 7,
      status_pagamento_nome: 'AGUARDANDO_AUTH',
    });
    prisma.pagamento.create.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 3,
      pagamento_valor_primeira_parcela: 335,
      pagamento_valor_parcelas: 333,
      status_pagamento: { status_pagamento_nome: 'AGUARDANDO_AUTH' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'CARTAO_CREDITO' },
    });

    await expect(
      service.create('usuario-1', {
        pedido_uuid: 'pedido-1',
        metodos_de_pagamento_id: 1,
        pagamento_numero_parcelas: 3,
      }),
    ).resolves.toEqual({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 3,
      pagamento_valor_primeira_parcela: 335,
      pagamento_valor_parcelas: 333,
      status_pagamento_nome: 'AGUARDANDO_AUTH',
      metodo_de_pagamento_nome: 'CARTAO_CREDITO',
    });
  });

  it('should create single installment payments with the full value', async () => {
    prisma.pedido.findUnique.mockResolvedValue({
      pedido_uuid: 'pedido-1',
      pedido_valor_total: 1000,
      endereco_de_entrega_uuid: 'endereco-1',
      status_pedido: { status_pedido_nome: 'PENDENTE' },
    });
    prisma.metodos_de_pagamento.findUnique.mockResolvedValue({
      metodos_de_pagamento_id: 1,
      metodo_de_pagamento_nome: 'PIX',
    });
    prisma.status_pagamento.findFirst.mockResolvedValue({
      status_pagamento_id: 7,
      status_pagamento_nome: 'AGUARDANDO_AUTH',
    });
    prisma.pagamento.create.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      status_pagamento: { status_pagamento_nome: 'AGUARDANDO_AUTH' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'PIX' },
    });

    await expect(
      service.create('usuario-1', {
        pedido_uuid: 'pedido-1',
        metodos_de_pagamento_id: 1,
      }),
    ).resolves.toMatchObject({
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
    });
  });

  it('should reject installment payment without credit card', async () => {
    prisma.pedido.findUnique.mockResolvedValue({
      pedido_uuid: 'pedido-1',
      pedido_valor_total: 1000,
      endereco_de_entrega_uuid: 'endereco-1',
      status_pedido: { status_pedido_nome: 'PENDENTE' },
    });
    prisma.metodos_de_pagamento.findUnique.mockResolvedValue({
      metodos_de_pagamento_id: 2,
      metodo_de_pagamento_nome: 'PIX',
    });

    await expect(
      service.create('usuario-1', {
        pedido_uuid: 'pedido-1',
        metodos_de_pagamento_id: 2,
        pagamento_numero_parcelas: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject payment creation for another user pedido', async () => {
    prisma.pedido.findUnique.mockResolvedValue({
      pedido_uuid: 'pedido-1',
      usuario_uuid: 'usuario-2',
      pedido_valor_total: 1000,
      endereco_de_entrega_uuid: 'endereco-1',
      status_pedido: { status_pedido_nome: 'PENDENTE' },
    });

    await expect(
      service.create('usuario-1', {
        pedido_uuid: 'pedido-1',
        metodos_de_pagamento_id: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should return payment status', async () => {
    prisma.pagamento.findUnique.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      pedido: { usuario_uuid: 'usuario-1' },
      status_pagamento: { status_pagamento_nome: 'AGUARDANDO_AUTH' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'PIX' },
    });

    await expect(
      service.getStatusPagamento('usuario-1', 'pagamento-1'),
    ).resolves.toEqual({
      pagamento_uuid: 'pagamento-1',
      status_pagamento_nome: 'AGUARDANDO_AUTH',
    });
  });

  it('should execute payment changing the status', async () => {
    prisma.pagamento.findUnique.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      pedido: { usuario_uuid: 'usuario-1' },
      status_pagamento: { status_pagamento_nome: 'AGUARDANDO_AUTH' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'PIX' },
    });
    prisma.status_pagamento.findFirst.mockResolvedValue({
      status_pagamento_id: 8,
      status_pagamento_nome: 'PAGO',
    });
    prisma.pagamento.update.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      status_pagamento: { status_pagamento_nome: 'PAGO' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'PIX' },
    });

    await expect(
      service.efetuarPagamento('usuario-1', 'pagamento-1'),
    ).resolves.toEqual({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      status_pagamento_nome: 'PAGO',
      metodo_de_pagamento_nome: 'PIX',
    });
  });

  it('should fail when the payment is not found', async () => {
    prisma.pagamento.findUnique.mockResolvedValue(null);

    await expect(
      service.getStatusPagamento('usuario-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject payment access from a different owner', async () => {
    prisma.pagamento.findUnique.mockResolvedValue({
      pagamento_uuid: 'pagamento-1',
      pedido_uuid: 'pedido-1',
      codigo_do_pagamento: 'codigo-1',
      pagamento_numero_parcelas: 1,
      pagamento_valor_primeira_parcela: 1000,
      pagamento_valor_parcelas: 1000,
      pedido: { usuario_uuid: 'usuario-2' },
      status_pagamento: { status_pagamento_nome: 'AGUARDANDO_AUTH' },
      metodos_de_pagamento: { metodo_de_pagamento_nome: 'PIX' },
    });

    await expect(
      service.getStatusPagamento('usuario-1', 'pagamento-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
