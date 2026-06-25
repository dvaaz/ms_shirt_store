export const pedidos = [
  {
    pedido_uuid: "1001",
    status_pedido: "Entregue",
    pedido_valor_total: 329.5,
    pedido_created_at: "24/06/2026",
    invoiceUrl: "/notafiscal1.pdf",
    item_pedido: [
      {
        id: "p1",
        item_pedido_nome_produto: "Camisa Pele",
        item_pedido_quantidade: 2,
        imagem:
          "https://m.media-amazon.com/imagems/I/41KyKbiLMpL._AC_SX522_.jpgom/80",
        item_pedido_preco: 29.9,
      },
      {
        id: "p2",
        item_pedido_nome_produto: "Camiseta Nike Dry Fit",
        item_pedido_quantidade: 3,
        imagem:
          "https://m.media-amazon.com/imagems/I/71FIRnFeabL._AC_SX569_.jpg",
        item_pedido_preco: 89.9,
      },
    ],
  },
  {
    pedido_uuid: "1002",
    status_pedido: "ACEITO",
    pedido_valor_total: 49.9,
    pedido_created_at: "20/06/2026",
    invoiceUrl: "notafiscal2.pdf",
    item_pedido: [
      {
        id: "p3",
        item_pedido_nome_produto: "Camiseta Basica Rosa",
        item_pedido_quantidade: 1,
        imagem:
          "https://m.media-amazon.com/images/I/71UmzTwO2vL._AC_UL320_.jpg",
        item_pedido_preco: 49.9,
      },
    ],
  },
];
