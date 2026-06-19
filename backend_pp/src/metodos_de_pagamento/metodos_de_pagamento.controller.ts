import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MetodosDePagamentoService } from './metodos_de_pagamento.service';
import type { CreateMetodosDePagamentoDto } from './dto/create-metodos_de_pagamento.dto';
import type { UpdateMetodosDePagamentoDto } from './dto/update-metodos_de_pagamento.dto';
import { metodos_de_pagamento as PagamentoModel } from '../generated/prisma/client';
import { ApiOperation } from '@nestjs/swagger';

@Controller('metodos_de_pagamento')
export class MetodosDePagamentoController {
  constructor(
    private readonly metodosDePagamentoService: MetodosDePagamentoService,
  ) { }

  @Get()
  findAll(): Promise<PagamentoModel[]> {
    return this.metodosDePagamentoService.findAll({});
  }

  @Get('/h')
  @ApiOperation({
    summary:
      'Health Check'
  })
  healthCheck() {
    return true
  }

  // @Get('/:id')
  // findOne(@Param('id') id: number): Promise<PagamentoModel | null> {
  //   return this.metodosDePagamentoService.findOne(+id); // o parametro está vindo como string o '+' alterna para number
  // }
}
