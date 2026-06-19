import { ApiProperty } from '@nestjs/swagger';

export class CreateItemPedidoDto {
  @ApiProperty({ description: 'Identificacao do produto', required: true })
  produto_id!: number;
  @ApiProperty({ description: 'Snapshot do nome do Produto ', required: false })
  produto_nome!: string;
  @ApiProperty({
    description: 'Preço do Produto no momento da criação',
    required: true,
  })
  produto_preco!: number;
  @ApiProperty({ description: 'Quantidade do Produto', required: true })
  item_quantidade!: number;
}
