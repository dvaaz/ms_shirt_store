import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusPagamentoDto } from './create-status_pagamento.dto';

export class UpdateStatusPagamentoDto extends PartialType(CreateStatusPagamentoDto) {}
