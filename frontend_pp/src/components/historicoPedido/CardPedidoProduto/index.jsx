export default function CardPedidoProduto({ produto, onComprarNovamente }) {
  const handleComprarNovamente = () => {
    onComprarNovamente({
      produtoId: produto.id,
      quantidade: produto.quantidade,
    });
  };

  return (
    <div>
      <img src={produto.imagem} alt={produto.item_pedido_nome_produto} />

      <h3>{produto.item_pedido_nome_produto}</h3>

      <p>R$ {produto.item_pedido_preco}</p>

      <span>Qtde: {produto.item_pedido_quantidade}</span>

      <button onClick={() => onComprarNovamente(produto)}>
        Comprar novamente
      </button>
    </div>
  );
}
