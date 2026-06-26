import styles from "./CardPedidoProduto.module.css";

export default function CardPedidoProduto({ produto, onComprarNovamente }) {
  const handleComprarNovamente = () => {
    onComprarNovamente({
      produtoId: produto.id,
      quantidade: produto.quantidade,
    });
  };

  return (
    <div className={styles.container}>
      <img
        className={styles.image}
        src={produto.imagem}
        alt={produto.item_pedido_nome_produto}
      />
      <div className={styles.info}>
        <div className={styles.titleDiv}>
          <h3 className={styles.title} title={produto.item_pedido_nome_produto}>
            {produto.item_pedido_nome_produto}
          </h3>
          {/* hoover */}
          <div className={styles.tooltip}>
            {produto.item_pedido_nome_produto}
          </div>
        </div>
        <span className={styles.price}>
          Preço:
          <span className={styles.value}> R$ {produto.item_pedido_preco}</span>
        </span>

        <span className={styles.quantity}>
          Qtde: {produto.item_pedido_quantidade}
        </span>
      </div>
      <button
        className={styles.button}
        onClick={() => onComprarNovamente(produto)}
      >
        <span className={styles.textButton}>Comprar novamente</span>
      </button>
    </div>
  );
}
