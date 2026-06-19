import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StatusPedidoService } from './status_pedido.service';
import type { CreateStatusPedidoDto } from './dto/create-status_pedido.dto';
import type { UpdateStatusPedidoDto } from './dto/update-status_pedido.dto';
import { status_pedido as StatusPedidoModel } from '../generated/prisma/client';

@Controller('status_pedido')
export class StatusPedidoController {
  constructor(private readonly StatusPedidoService: StatusPedidoService) {}

  // @Post()
  // create(@Body() createStatusPedidoDto: CreateStatusPedidoDto): Promise<StatusPedidoModel> {
  //   return this.StatusPedidoService.create(createStatusPedidoDto);
  // }
  //

  @Get()
  findAll(): Promise<StatusPedidoModel[]> {
    return this.StatusPedidoService.findAll({});
  }

  @Get('/:id')
  findOne(@Param('id') id: number): Promise<StatusPedidoModel | null> {
    return this.StatusPedidoService.findOne(+id); // o parametro está vindo como string o '+' alterna para number
  }
}
