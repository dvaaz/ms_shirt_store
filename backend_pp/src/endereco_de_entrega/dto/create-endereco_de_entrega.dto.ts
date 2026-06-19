import { ApiProperty } from '@nestjs/swagger';

export class CreateEnderecoDeEntregaDto {
  @ApiProperty({ description: 'UF do endereço de entrega', required: false })
  uf?: string;
  @ApiProperty({ description: 'UUID do USUARIO', required: false })
  destinatario?: string;
  @ApiProperty({
    description: 'Município do endereço de entrega',
    required: false,
  })
  municipio?: string;
  @ApiProperty({
    description: 'Logradouro do endereço de entrega',
    required: false,
  })
  logradouro?: string;
  @ApiProperty({
    description: 'Número do endereço de entrega',
    required: false,
  })
  numero?: number;
  @ApiProperty({
    description: 'Complemento do endereço de entrega',
    required: false,
  })
  complemento?: string;
  @ApiProperty({ description: 'CEP do endereço de entrega', required: true })
  cep!: string;

  // Recebe o valor e retorna limpo
  static cepLimpo(cep: string | number): string {
    return String(cep || '').replace(/\D/g, '');
  }

  // Recebe o valor e retorna o número
  static numeroInt(numero: any): number {
    if (typeof numero === 'string') {
      const parsed = parseInt(numero, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return numero || 0;
  }
}
