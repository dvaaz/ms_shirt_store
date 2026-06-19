import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateStatusPedidoDto } from './dto/create-status_pedido.dto';
import type { UpdateStatusPedidoDto } from './dto/update-status_pedido.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  status_pedido as StatusPedidoModel,
} from '../generated/prisma/client.js';

// A única funcao do servico de status é gerenciar os pedidos no proprio sistema, o controller sera apagado ou reduzido a um endpoint de consulta, para adm.
@Injectable()
export class StatusPedidoService {
  constructor(private readonly prisma: PrismaService) { }

  // lógica de atualização do status do pedido:
  private arrayDeStatusRegistrados = [
    'CANCELADO',
    'DEVOLUCAO',
    'PENDENTE',
    'ACEITO',
    'APROVADO',
    'SEPARACAO',
    'ENVIADO',
    'ENTREGUE',
  ];

  /**
   * Função para fazer a mudança do status do pedido de acordo com a lógica de negócio. retorna o id do status atualizado
   *
   */
  async updateStatusPedido(
    nome: string,
  ): Promise<StatusPedidoModel['status_pedido_id']> {
    if (!nome) {
      throw new BadRequestException('O nome do status do pedido é obrigatório');
    }

    const statusFormatado = nome.trim().toUpperCase();

    if (!this.arrayDeStatusRegistrados.includes(statusFormatado)) {
      throw new BadRequestException('Status do pedido não registrado no sistema');
    }

    const status = await this.prisma.status_pedido.findFirst({
      where: { status_pedido_nome: statusFormatado },
      select: {
        status_pedido_id: true,
        status_pedido_nome: true,
      },
    });

    if (!status) {
      throw new NotFoundException('Status do pedido não encontrado no banco de dados');
    }

    const indexDoStatusAtual = this.arrayDeStatusRegistrados.indexOf(
      status.status_pedido_nome?.toUpperCase() || '',
    );

    if (indexDoStatusAtual === -1) {
      throw new BadRequestException(`Status do pedido inválido.`);
    }

    // Bloqueia alterações se já estiver nos estados finais/imutáveis do fluxo linear
    if (indexDoStatusAtual === 0 || indexDoStatusAtual === 1) {
      throw new BadRequestException(`Não é permitido atualizar um pedido cancelado ou devolvido.`);
    }

    if (indexDoStatusAtual === this.arrayDeStatusRegistrados.length - 1) {
      throw new BadRequestException(
        `O pedido já foi entregue, não é permitido atualizar o status.`,
      );
    }

    const novoStatus = this.arrayDeStatusRegistrados[indexDoStatusAtual + 1];

    const statusEncontrado = await this.prisma.status_pedido.findFirst({
      where: { status_pedido_nome: novoStatus },
      select: { status_pedido_id: true },
    });

    if (!statusEncontrado) {
      throw new NotFoundException(`Próximo status (${novoStatus}) não foi populado no banco.`);
    }

    return statusEncontrado.status_pedido_id;
  }

  ///////////------------------------------------------\\\\\\\\\\\\\\\\\\\\
  // ATENCAO, TODAS AS FUNCOES ABAIXO DEVEM SER TRATADAS NO DB,
  // PARA GARANTIR A INTEGRIDADE DOS DADOS E EVITAR PROBLEMAS DE CONCORRENCIA.
  //  -----------------------------------------------------\\\\\\\\\\

  /**
   * Cria novo método de pagamento
   * @param data
   * @returns
   */
  async create(data: CreateStatusPedidoDto): Promise<StatusPedidoModel> {
    if (!data.nome || data.nome.trim() === '') {
      throw new Error('O nome do método de pagamento é obrigatório');
    }
    const model: Omit<StatusPedidoModel, 'status_pedido_id'> = {
      status_pedido_nome: data.nome.trim().toUpperCase(),
    };
    return await this.prisma.status_pedido.create({ data: model });
  }

  /**
   * Busca todos os métodos de pagamento
   * @param params
   * @returns
   */
  async findAll(params: {
    skip?: number; // Número de registros a pular
    take?: number; // Número de registros a buscar
    cursor?: PrismaClient.status_pedidoWhereUniqueInput; // Cursor para paginação
    where?: PrismaClient.status_pedidoWhereInput; // Filtros para a consulta
    orderBy?: PrismaClient.status_pedidoOrderByWithRelationInput; // Ordenação dos resultados
  }): Promise<StatusPedidoModel[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.status_pedido.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  /**
   * Busca por um método por id
   * @param input
   * @returns
   */
  async findOne(input: number): Promise<StatusPedidoModel | null> {
    try {
      return await this.prisma.status_pedido.findUnique({
        where: { status_pedido_id: input },
      });
    } catch (e) {
      if (
        e instanceof PrismaClient.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new Error('Método de pagamento não encontrado');
      }
      throw e; // Para outros erros
    }
  }

  /**
   * Update de método de pagamento. na entrega utilizar o DB para fazer essa atualização, para garantir a integridade dos dados e evitar problemas de concorrência.
   * @param id
   * @param data
   * @returns
   */
  async update(params: {
    where: PrismaClient.status_pedidoWhereUniqueInput;
    data: UpdateStatusPedidoDto;
  }): Promise<StatusPedidoModel> {
    try {
      if (params.data.nome && params.data.nome.trim() === '') {
        throw new Error('O nome do método de pagamento não pode ser vazio');
      }
      const updateData: Partial<StatusPedidoModel> = {};
      if (params.data.nome) {
        updateData.status_pedido_nome = params.data.nome.trim().toUpperCase();
      }
      return await this.prisma.status_pedido.update({
        where: { status_pedido_id: params.where.status_pedido_id },
        data: updateData,
      });
    } catch (e) {
      if (
        e instanceof PrismaClient.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new Error('Método de pagamento não encontrado');
      }
      throw e;
    }
  }

  /**
   * Remover método de pagamento. Na entrega, passa se a fazer o registro pelo DB
   * @param id
   * @returns
   */
  async remove(where: PrismaClient.status_pedidoWhereUniqueInput) {
    try {
      return await this.prisma.status_pedido.delete({ where });
    } catch (e) {
      if (
        e instanceof PrismaClient.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new Error('Método de pagamento não encontrado');
      }
      throw e;
    }
  }
}
