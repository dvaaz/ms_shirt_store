import { Injectable } from '@nestjs/common';
import type { CreateMetodosDePagamentoDto as createDto } from './dto/create-metodos_de_pagamento.dto';
import type { UpdateMetodosDePagamentoDto as updateDto } from './dto/update-metodos_de_pagamento.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  metodos_de_pagamento as MetodoPagamentoModel,
} from '../generated/prisma/client.js';

@Injectable()
export class MetodosDePagamentoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria novo método de pagamento
   * @param data
   * @returns
   */
  async create(data: createDto): Promise<MetodoPagamentoModel> {
    if (!data.nome || data.nome.trim() === '') {
      throw new Error('O nome do método de pagamento é obrigatório');
    }
    const model: Omit<MetodoPagamentoModel, 'metodos_de_pagamento_id'> = {
      metodo_de_pagamento_nome: data.nome.trim().toUpperCase(),
    };
    return await this.prisma.metodos_de_pagamento.create({ data: model });
  }

  /**
   * Busca um método de pagamento pelo nome.
   */
  async findByName(nome: string): Promise<MetodoPagamentoModel | null> {
    if (!nome || nome.trim() === '') {
      return null;
    }

    return await this.prisma.metodos_de_pagamento.findFirst({
      where: { metodo_de_pagamento_nome: nome.trim().toUpperCase() },
    });
  }

  /**
   * Busca todos os métodos de pagamento
   * @param params
   * @returns
   */
  async findAll(params: {
    skip?: number; // Número de registros a pular
    take?: number; // Número de registros a buscar
    cursor?: PrismaClient.metodos_de_pagamentoWhereUniqueInput; // Cursor para paginação
    where?: PrismaClient.metodos_de_pagamentoWhereInput; // Filtros para a consulta
    orderBy?: PrismaClient.metodos_de_pagamentoOrderByWithRelationInput; // Ordenação dos resultados
  }): Promise<MetodoPagamentoModel[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.metodos_de_pagamento.findMany({
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
  async findOne(input: number): Promise<MetodoPagamentoModel | null> {
    try {
      return await this.prisma.metodos_de_pagamento.findUnique({
        where: { metodos_de_pagamento_id: input },
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
   * Update de método de pagamento
   * @param id
   * @param data
   * @returns
   */
  async update(params: {
    where: PrismaClient.metodos_de_pagamentoWhereUniqueInput;
    data: updateDto;
  }): Promise<MetodoPagamentoModel> {
    try {
      if (params.data.nome && params.data.nome.trim() === '') {
        throw new Error('O nome do método de pagamento não pode ser vazio');
      }
      const updateData: Partial<MetodoPagamentoModel> = {};
      if (params.data.nome) {
        updateData.metodo_de_pagamento_nome = params.data.nome
          .trim()
          .toUpperCase();
      }
      return await this.prisma.metodos_de_pagamento.update({
        where: {
          metodos_de_pagamento_id: params.where.metodos_de_pagamento_id,
        },
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
   * Remover método de pagamento
   * @param id
   * @returns
   */
  async remove(where: PrismaClient.metodos_de_pagamentoWhereUniqueInput) {
    try {
      return await this.prisma.metodos_de_pagamento.delete({ where });
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
