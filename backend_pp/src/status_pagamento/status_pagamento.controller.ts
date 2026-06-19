import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StatusPagamentoService } from './status_pagamento.service';
import { status_pagamento as StatusPagamentoModel } from '../generated/prisma/client.js';

@Controller('status_pagamento')
export class StatusPagamentoController {
  constructor(
    private readonly StatusPagamentoService: StatusPagamentoService,
  ) {}

  // @Get()
  // findAll(): Promise<StatusPagamentoModel[]> {
  //   return this.StatusPagamentoService.findAll({});
  // }

  // @Get('/:id')
  // findOne(@Param('id') id: number): Promise<StatusPagamentoModel | null> {
  //   return this.StatusPagamentoService.findOne(+id); // o parametro está vindo como string o '+' alterna para number
  // }
}
