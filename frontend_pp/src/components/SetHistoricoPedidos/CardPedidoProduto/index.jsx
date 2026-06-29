import { useCallback } from "react";
import carrinhoService from "../../../services/carrinho/Carrinho.service";
import styles from "./CardPedidoProduto.module.css";

export default function CardPedidoProduto({ produto, usuarioUuid }) {
  // responsabilidade do card: adicionar o próprio produto no carrinho
  const handleComprarNovamente = useCallback(async () => {
    const payload = {
      produtoId: produto.id_produto,
      quantidade: produto.quantidade ?? produto.item_pedido_quantidade,
    };

    try {
      await carrinhoService.adicionarItem(payload, usuarioUuid);
    } catch {
      // TODO: feedback visual de erro ao adicionar no carrinho
    }
  }, [produto, usuarioUuid]);

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
      <button className={styles.button} onClick={handleComprarNovamente}>
        <span className={styles.textButton}>Comprar novamente</span>
      </button>
    </div>
  );
}
