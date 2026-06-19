import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateItemPedidoDto } from './dto/create-item_pedido.dto';
import { UpdateItemPedidoDto } from './dto/update-item_pedido.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  Prisma as PrismaClient,
  item_pedido as ItemPedidoModel,
} from '../generated/prisma/client.js';

@Injectable()
export class ItemPedidoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Essa funcao recebe um um DTO de criação de itemPedido, entra em contato com API externa para verificar os nome e preços atuais do produto
   * @param createItemPedidoDto
   * @returns
   */
  async create(
    pedidoId: string,
    createItemPedidoDto: Omit<CreateItemPedidoDto, 'pedido_uuid'>[],
  ): Promise<[ItemPedidoModel[], number]> {
    // Aqui a funcao recebe o id do produto e entra em contato com a API externa para verificar o nome e o preço atual do produto. Depois disso, o itemPedido é criado
    // No Prisma de SQL não há uma função imbutida que retorne os itens criados, então utilizarei o $transaction que apesar de mais lento, para esse trabalho será o suficiente
    try {
      const itensDoPedido = await this.prisma.$transaction(
        createItemPedidoDto.map((item) =>
          this.prisma.item_pedido.create({
            data: {
              pedido_uuid: pedidoId,
              id_produto: item.produto_id,
              item_pedido_quantidade: item.item_quantidade,
              item_pedido_nome_produto: item.produto_nome,
              item_pedido_preco: item.produto_preco,
              item_pedido_total_preco:
                item.item_quantidade * item.produto_preco,
            },
          }),
        ),
      );

      const valorTotalDoPedido = itensDoPedido.reduce(
        (total, item) => total + item.item_pedido_total_preco,
        0,
      );

      return [itensDoPedido, valorTotalDoPedido]; //
    } catch (error) {
      throw new BadRequestException(
        `Não foi possivel adicionar o item ${error}`,
      );
    }
  }

  async findAll(pedidoId: string): Promise<ItemPedidoModel[]> {
    try {
      return this.prisma.item_pedido.findMany({
        where: { pedido_uuid: pedidoId },
      });
    } catch (error) {
      throw new BadRequestException(
        `Não foi possivel encontrar os itens do pedido ${error}`,
      );
    }
  }

  async findOne(itemId: number): Promise<ItemPedidoModel | null> {
    // A busca por item pedido será feita através do id do item e do pedido
    return this.prisma.item_pedido.findFirst({
      where: { item_pedido_id: itemId },
    });
  }

  update(id: number, updateItemPedidoDto: UpdateItemPedidoDto) {
    // não haverá update de itemPedido, mas vamos deixar esse método aqui para manter a estrutura do CRUD
    return `This action updates a #${id} itemPedido`;
  }

  remove(id: number) {
    // não haverá remoção de itemPedido, mas vamos deixar esse método aqui para manter a estrutura do CRUD
    return `This action removes a #${id} itemPedido`;
  }
}
