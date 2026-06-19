export class FullPedidoDto {
  pedido_id: string;
  pedido_valor_total: string;
  pedido_status: string;
  data_criacao: Date;
  data_atualizacao: Date;
  // Array com os dados do endereço de entrega
  endereco_entrega: {
    cep: string;
    uf?: string;
    destinatario?: string;
    municipio?: string;
    logradouro?: string;
    numero?: number;
    complemento?: string;
  };
  // Array de produtos do pedido, com nome, descrição, preço unitário e quantidade
  produto_pedido: {
    produto_nome: string;
    preco_unitario: string;
    quantidade: number;
    id_produto: number;
  }[];
}
