import { Injectable } from '@nestjs/common';
import type { CreateStatusPagamentoDto } from './dto/create-status_pagamento.dto';
import type { UpdateStatusPagamentoDto } from './dto/update-status_pagamento.dto';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  status_pagamento as StatusPagamentoModel,
} from '../generated/prisma/client.js';

@Injectable()
export class StatusPagamentoService {

      // lógica de atualização do status do pedido:
    #arrayDeStatusRegistrados = [
      'APROVADO',
      'REJEITADO',
      'AGUARDANDO_AUTH',
    ];

  constructor(private readonly prisma: PrismaService) {}

/**
 * Funcao para alterar o status do pagamento através de seu nome
  * Vai depender de resposta externa. 
*/
async updateStatusPagamento(nome: string): Promise<void> {
  if (!nome) {
    throw new Error('O nome do status do pagamento é obrigatório');
  }
  // verifica se o status do pagamento esta registrado
  if (!this.#arrayDeStatusRegistrados.includes(nome.trim().toUpperCase())) {
    throw new Error('Status do pagamento não registrado');
  }
  

  const status = await this.prisma.status_pagamento.findFirst({
    where: { status_pagamento_nome: nome.trim().toUpperCase() },
    select: {
      status_pagamento_id: true,
      status_pagamento_nome: true,
    },
  });
  if (!status || !status.status_pagamento_id || !status.status_pagamento_nome) {
    throw new Error('Status do pagamento não encontrado');
  }
}

  /**
   * Busca um status de pagamento pelo ID.
   */
  async findOne(id: number): Promise<StatusPagamentoModel> {
    const status = await this.prisma.status_pagamento.findUnique({
      where: { status_pagamento_id: id },
    });
    if (!status) {
      throw new Error('Status do pagamento não encontrado');
    }
    return status;
  }

  /**
   * Busca um status de pagamento pelo nome
   */
  async findByName(nome: string): Promise<StatusPagamentoModel> {
    if (!nome || typeof nome !== 'string') {
      throw new Error('O nome do status do pagamento é obrigatório');
    }
    const nomeFormatado = nome.trim().toUpperCase();
    if (!this.#arrayDeStatusRegistrados.includes(nomeFormatado)) {
      throw new Error('Status do pagamento não registrado');
    }
    const status = await this.prisma.status_pagamento.findFirst({
      where: { status_pagamento_nome: nomeFormatado },
      select: {
        status_pagamento_id: true,
        status_pagamento_nome: true,
      },
    });

    if (!status || !status.status_pagamento_id || !status.status_pagamento_nome) {
      throw new Error('Status do pagamento não encontrado');
    }
    return status;
  }

}
