import { PartialType } from '@nestjs/mapped-types';
import { CreateMetodosDePagamentoDto } from './create-metodos_de_pagamento.dto';
export class UpdateMetodosDePagamentoDto extends PartialType(
  CreateMetodosDePagamentoDto,
) {}
