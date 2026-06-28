import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { ItemPedidoService } from './item_pedido.service';
import { CreateItemPedidoDto } from './dto/create-item_pedido.dto';
import { UpdateItemPedidoDto } from './dto/update-item_pedido.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Produtos do Pedido')
@Controller('item-pedido')
export class ItemPedidoController {
  constructor(private readonly itemPedidoService: ItemPedidoService) {}

  @Get(':pedidoId')
  @ApiTags('Produtos de um Pedido')
  findAll(
    @Headers('userId') userId: string,
    @Param('pedidoId') pedidoId: string,
  ) {
    return this.itemPedidoService.findAll(userId, pedidoId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemPedidoDto: UpdateItemPedidoDto,
  ) {
    return this.itemPedidoService.update(+id, updateItemPedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemPedidoService.remove(+id);
  }
}
