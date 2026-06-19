// envia a lista simples de uuid dos pedidos
export class ResponseListaPedidoDTO {
  pedido_uuid!: string; 
  pedido_valor_total!: string;
  pedido_created_at!: Date;
  status_pedido!: string; 
}