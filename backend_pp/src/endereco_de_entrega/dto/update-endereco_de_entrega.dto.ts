import { CreateEnderecoDeEntregaDto } from './create-endereco_de_entrega.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateEnderecoDeEntregaDto extends PartialType(
  CreateEnderecoDeEntregaDto,
) {}
