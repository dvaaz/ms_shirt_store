import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';

// Types auxiliares para evitar repetição de tipos complexos em vários métodos do serviço
type PagamentoComStatus = {
  pagamento_uuid: string;
  pedido_uuid: string;
  codigo_do_pagamento: string;
  pagamento_numero_parcelas: number | null;
  pagamento_valor_primeira_parcela: number | null;
  pagamento_valor_parcelas: number | null;
  status_pagamento_nome: string;
  metodo_de_pagamento_nome: string;
};

type PagamentoConsulta = {
  pagamento_uuid: string;
  pedido_uuid: string;
  codigo_do_pagamento: string;
  pagamento_numero_parcelas: number | null;
  pagamento_valor_primeira_parcela: number | null;
  pagamento_valor_parcelas: number | null;
  pedido?: {
    usuario_uuid: string;
  };
  status_pagamento: {
    status_pagamento_nome: string;
  };
  metodos_de_pagamento: {
    metodo_de_pagamento_nome: string | null;
  };
};

// O serviço de pagamento é responsável por toda a lógica relacionada à criação e atualização de pagamentos,
@Injectable()
export class PagamentoService {
  private readonly statusAguardandoAuth = 'AGUARDANDO_AUTH';
  private readonly statusPago = 'PAGO';
  private readonly metodoCartaoCredito = 'CARTAO_CREDITO';
  private readonly defaultNumeroParcelas = 1;
  private readonly statusPedidoAceito = 'ACEITO';

  constructor(private readonly prisma: PrismaService) {}

  private normalize(valor: string | null | undefined): string {
    return (valor ?? '').trim().toUpperCase();
  }

  /**
   * Divide o valor total em centavos entre as parcelas e concentra o resto
   * de centavos na primeira parcela para evitar perda de centavos.
   */
  private calcularParcelamento(valorTotal: number, numeroParcelas: number) {
    const valorBase = Math.floor(valorTotal / numeroParcelas);
    const centavosRestantes = valorTotal % numeroParcelas;

    return {
      valorPrimeiraParcela: valorBase + centavosRestantes,
      valorParcelas: valorBase,
    };
  }

  private async buscarStatus(nome: string) {
    const statusNormalizado = this.normalize(nome);
    const status = await this.prisma.status_pagamento.findFirst({
      where: { status_pagamento_nome: statusNormalizado },
      orderBy: { status_pagamento_id: 'asc' },
      select: {
        status_pagamento_id: true,
        status_pagamento_nome: true,
      },
    });

    if (!status) {
      throw new NotFoundException(
        `Status de pagamento ${statusNormalizado} não encontrado`,
      );
    }

    return status;
  }

  private async buscarPagamento(pagamentoUuid: string) {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { pagamento_uuid: pagamentoUuid },
      select: {
        pagamento_uuid: true,
        pedido_uuid: true,
        codigo_do_pagamento: true,
        pagamento_numero_parcelas: true,
        pagamento_valor_primeira_parcela: true,
        pagamento_valor_parcelas: true,
        pedido: {
          select: {
            usuario_uuid: true,
          },
        },
        status_pagamento: {
          select: {
            status_pagamento_id: true,
            status_pagamento_nome: true,
          },
        },
        metodos_de_pagamento: {
          select: {
            metodos_de_pagamento_id: true,
            metodo_de_pagamento_nome: true,
          },
        },
      },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (
      !pagamento.status_pagamento ||
      !pagamento.metodos_de_pagamento ||
      !pagamento.metodos_de_pagamento.metodo_de_pagamento_nome
    ) {
      throw new InternalServerErrorException('Pagamento está inconsistente');
    }

    return pagamento;
  }

  /**
   * Buscar pagamento do usuário
   * @param userId 
   * @param pagamentoUuid 
   * @returns 
   */
  private async buscarPagamentoDoUsuario(
    userId: string,
    pagamentoUuid: string,
  ) {
    const pagamento = await this.buscarPagamento(pagamentoUuid);

    if (!pagamento.pedido) {
      throw new InternalServerErrorException(
        'Pagamento inconsistente: pedido associado não encontrado',
      );
    }

    if (pagamento.pedido.usuario_uuid !== userId) {
      throw new NotFoundException('Pagamento não encontrado para usuario', userId);
    }

    return pagamento;
  }


  private async buscarPedidoDoUsuario(usuarioId: string, pedidoUuid: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: {
        pedido_uuid: pedidoUuid,
      },
      select: {
        pedido_uuid: true,
        usuario_uuid: true,
        pedido_valor_total: true,
        endereco_de_entrega_uuid: true,
        status_pedido: {
          select: {
            status_pedido_nome: true,
          },
        },
      },
    });

    if (!pedido || pedido.usuario_uuid !== usuarioId) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return pedido;
  }

  private toPagamentoComStatus(
    pagamento: PagamentoConsulta,
  ): PagamentoComStatus {
    const { metodo_de_pagamento_nome: metodoDePagamentoNome } =
      pagamento.metodos_de_pagamento;

    if (!metodoDePagamentoNome) {
      throw new InternalServerErrorException('Método de pagamento inválido');
    }

    return {
      pagamento_uuid: pagamento.pagamento_uuid,
      pedido_uuid: pagamento.pedido_uuid,
      codigo_do_pagamento: pagamento.codigo_do_pagamento,
      pagamento_numero_parcelas: pagamento.pagamento_numero_parcelas,
      pagamento_valor_primeira_parcela:
        pagamento.pagamento_valor_primeira_parcela,
      pagamento_valor_parcelas: pagamento.pagamento_valor_parcelas,
      status_pagamento_nome: pagamento.status_pagamento.status_pagamento_nome,
      metodo_de_pagamento_nome: metodoDePagamentoNome,
    };
  }

  async create(
    usuarioId: string,
    createPagamentoDto: CreatePagamentoDto,
  ): Promise<PagamentoComStatus> {
    const pedido = await this.buscarPedidoDoUsuario(
      usuarioId,
      createPagamentoDto.pedido_uuid,
    );

    if (
      !pedido.endereco_de_entrega_uuid ||
      !pedido.endereco_de_entrega_uuid.trim()
    ) {
      throw new BadRequestException('O pedido precisa ter endereço de entrega');
    }

    if (
      !pedido.status_pedido ||
      this.normalize(pedido.status_pedido.status_pedido_nome) !==
        this.statusPedidoAceito
    ) {
      throw new BadRequestException(
        'O pagamento só pode ser criado para pedidos aceitos',
      );
    }

    if (pedido.pedido_valor_total <= 0) {
      throw new BadRequestException(
        'O pedido precisa ter valor total maior que zero',
      );
    }

    const metodo = await this.prisma.metodos_de_pagamento.findFirst({
      where: {
        metodo_de_pagamento_nome: createPagamentoDto.metodos_de_pagamento_nome,
      },
      select: {
        metodos_de_pagamento_id: true,
        metodo_de_pagamento_nome: true,
      },
    });

    if (!metodo || !metodo.metodo_de_pagamento_nome) {
      throw new NotFoundException('Método de pagamento não encontrado');
    }

    const numeroParcelasSolicitadas =
      createPagamentoDto.pagamento_numero_parcelas;
    if (
      numeroParcelasSolicitadas !== undefined &&
      numeroParcelasSolicitadas < 1
    ) {
      throw new BadRequestException(
        'A quantidade de parcelas precisa ser maior que zero',
      );
    }
    const numeroParcelas =
      numeroParcelasSolicitadas ?? this.defaultNumeroParcelas;

    if (
      numeroParcelas > 1 &&
      this.normalize(metodo.metodo_de_pagamento_nome) !==
        this.metodoCartaoCredito
    ) {
      throw new BadRequestException(
        'Pagamentos parcelados só podem ser feitos com cartão de crédito',
      );
    }

    const statusAguardandoAuth = await this.buscarStatus(
      this.statusAguardandoAuth,
    );
    const pagamentoUuid = uuidv7();
    const codigoDoPagamento = uuidv7();
    const parcelamento = this.calcularParcelamento(
      pedido.pedido_valor_total,
      numeroParcelas,
    );

    const pagamento = await this.prisma.pagamento.create({
      data: {
        pagamento_uuid: pagamentoUuid,
        codigo_do_pagamento: codigoDoPagamento,
        pedido_uuid: pedido.pedido_uuid,
        metodos_de_pagamento_id: metodo.metodos_de_pagamento_id,
        status_pagamento_id: statusAguardandoAuth.status_pagamento_id,
        pagamento_numero_parcelas: numeroParcelas,
        pagamento_valor_primeira_parcela: parcelamento.valorPrimeiraParcela,
        pagamento_valor_parcelas: parcelamento.valorParcelas,
      },
      select: {
        pagamento_uuid: true,
        pedido_uuid: true,
        codigo_do_pagamento: true,
        pagamento_numero_parcelas: true,
        pagamento_valor_primeira_parcela: true,
        pagamento_valor_parcelas: true,
        status_pagamento: {
          select: {
            status_pagamento_nome: true,
          },
        },
        metodos_de_pagamento: {
          select: {
            metodo_de_pagamento_nome: true,
          },
        },
      },
    });

    return this.toPagamentoComStatus(pagamento);
  }

  async getStatusPagamento(userId: string, pagamentoUuid: string) {
    const pagamento = await this.buscarPagamentoDoUsuario(
      userId,
      pagamentoUuid,
    );

    return {
      pagamento_uuid: pagamento.pagamento_uuid,
      status_pagamento_nome: pagamento.status_pagamento.status_pagamento_nome,
    };
  }

  async efetuarPagamento(
    userId: string,
    pagamentoUuid: string,
  ): Promise<PagamentoComStatus> {
    const pagamentoAtual = await this.buscarPagamentoDoUsuario(
      userId,
      pagamentoUuid,
    );

    if (
      this.normalize(pagamentoAtual.status_pagamento.status_pagamento_nome) !==
      this.statusAguardandoAuth
    ) {
      throw new BadRequestException(
        'Só é possível efetuar pagamentos aguardando autorização',
      );
    }

    const statusPago = await this.buscarStatus(this.statusPago);

    const pagamento = await this.prisma.pagamento.update({
      where: { pagamento_uuid: pagamentoUuid },
      data: {
        status_pagamento_id: statusPago.status_pagamento_id,
      },
      select: {
        pagamento_uuid: true,
        pedido_uuid: true,
        codigo_do_pagamento: true,
        pagamento_numero_parcelas: true,
        pagamento_valor_primeira_parcela: true,
        pagamento_valor_parcelas: true,
        status_pagamento: {
          select: {
            status_pagamento_nome: true,
          },
        },
        metodos_de_pagamento: {
          select: {
            metodo_de_pagamento_nome: true,
          },
        },
      },
    });

    return this.toPagamentoComStatus(pagamento);
  }
}
