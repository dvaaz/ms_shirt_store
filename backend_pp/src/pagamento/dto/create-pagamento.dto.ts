import { ApiProperty } from '@nestjs/swagger';

export class CreatePagamentoDto {
  @ApiProperty({ description: 'UUID do pedido' })
  pedido_uuid!: string;

  @ApiProperty({
    description: 'Nome do método de pagamento',
    enum: ['PIX', 'BOLETO_BANCARIO', 'CARTAO_CREDITO'],
  })
  metodos_de_pagamento_nome!: string;

  @ApiProperty({
    description: 'Quantidade de parcelas',
    required: false,
    minimum: 1,
  })
  pagamento_numero_parcelas?: number;
}
