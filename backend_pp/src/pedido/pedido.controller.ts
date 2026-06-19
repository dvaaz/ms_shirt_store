import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Headers,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ApiOperation } from '@nestjs/swagger';
import { pedido as PedidoModel } from '../generated/prisma/client.js';
import { FullPedidoDto } from './dto/full-pedido.dto';
import request from 'supertest';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('userId') userId: string,
    @Body() createPedidoDto: CreatePedidoDto,
  ): Promise<FullPedidoDto> {
    const request = await this.pedidoService.create(userId, createPedidoDto);
    if (!request) {
      throw new InternalServerErrorException('Erro ao criar pedido');
    }
    const response = await this.pedidoService.composePedido(
      request.usuario_uuid,
      request.pedido_uuid,
    );
    return response;
  }

  @Get('/h')
  @ApiOperation({
    summary:
      'Health Check: ' +'Pedido'
  })
  healthCheck() {
    return true
  }

  @Get()
  @ApiOperation({
    summary:
    'Busca pedidos de um usuário. Retorna Id de pedido e status'
  })
  findAll(@Headers('userId') userId: string) {
    return this.pedidoService.findAllSimple(userId);
  }

  @Get('full/:pedidoId')
  composePedido(
    @Headers('userId') userId: string,
    @Param('pedidoId') pedidoId: string,
  ): Promise<FullPedidoDto> {
    return this.pedidoService.composePedido(userId, pedidoId);
  }

  @Get('findone/:id')
  findOne(@Param('id') id: string) {
    return this.pedidoService.findOne(id);
  }

  @Get('validaCompra/:id')
  @ApiOperation({
    summary:
      'Valida se a compra foi realizada, verificando se os produtos foram entregues ',
  })
  verificaCompraRealizada(
    @Headers('userId') userId: string,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.pedidoService.verificaCompraRealizada(userId, id);
  }

  @Patch('update-endereco/:id')
  @ApiOperation({
    summary:
      'Atualiza o endereço de entrega de um pedido com outro já existente',
  })
  updateEndereco(@Param('id') id: string, @Body() enderecoId: string) {
    return this.pedidoService.updateEndereco(id, enderecoId);
  }

  // funcao nao esta atualizando
  @Patch('update-status/:id')
  @HttpCode(HttpStatus.NO_CONTENT) // veridicar documentacao
  @ApiOperation({
    summary: 'Atualiza o status do pedido para o próximo status na sequência',
  })
  updateStatusPedido(@Param('id') id: string) {
    const response = this.pedidoService.updateStatusPedido(id);
    if (response) {
      // mensagem de 204 no frontend
      return response;
    } else {
      return HttpCode(HttpStatus.BAD_REQUEST); // mensagem de 400 no frontend
    }
  }
}
