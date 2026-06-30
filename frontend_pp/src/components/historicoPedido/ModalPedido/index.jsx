import { useCallback, useEffect, useRef, useState } from "react";
import authService from "../../../services/login/Auth.service";
import CardPedidoProduto from "../CardPedidoProduto/index";
import styles from "./ModalPedido.module.css";

const STATUS_STYLE = {
  "Em Separação": styles.statusSeparacao,
  Enviado: styles.statusEnviado,
  Entregue: styles.statusEntregue,
  Cancelado: styles.statusCancelado,
};

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// recebera um pedido como prop: { id, data, status, valorTotal }
export default function ModalPedido({ pedido, onComprarNovamente, onVerNotaFiscal }) {
  const [open, setOpen] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const carregadoRef = useRef(false);
  const imagensUrlsRef = useRef([]);

  // libera as object URLs das imagens quando o card sai da tela
  useEffect(() => {
    return () => {
      imagensUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await authService.get(`/item-pedido/${pedido.id}`);

      const comImagem = await Promise.all(
        data.map(async (item) => {
          try {
            const { data: imagemBlob } = await authService.get(
              `/produto/picture/${item.item_pedido_id_produto}`,
              { responseType: "blob" },
            );
            const url = URL.createObjectURL(imagemBlob);
            imagensUrlsRef.current.push(url);
            return { ...item, imagem: url };
          } catch {
            return { ...item, imagem: null };
          }
        }),
      );

      setProdutos(comImagem);
      carregadoRef.current = true;
    } catch {
      setError("Não foi possível carregar os itens do pedido.");
    } finally {
      setLoading(false);
    }
  }, [pedido.id]);

  const handleToggle = () => {
    const proximoEstado = !open;
    setOpen(proximoEstado);

    if (proximoEstado && !carregadoRef.current) {
      carregarProdutos();
    }
  };

  const statusClass = STATUS_STYLE[pedido.status] ?? styles.statusDefault;

  return (
    <div className={styles.container}>
      <button type="button" className={styles.card} onClick={handleToggle}>
        <span className={`${styles.text} ${styles.pedido}`}>
          Pedido: <strong>#{pedido.id}</strong>
        </span>

        {!open && (
          <span className={`${styles.text} ${styles.preco}`}>
            R$ <span>{pedido.valorTotal}</span>
          </span>
        )}

        <span className={`${styles.text} ${styles.data}`}>
          Realizado em: {formatarData(pedido.data)}
        </span>

        <div className={`${styles.text} ${styles.status} ${statusClass}`}>
          {pedido.status}
        </div>
      </button>

      {!open && (
        <div className={styles.pagination}>
          <span />
          <span />
          <span />
        </div>
      )}

      {open && (
        <div className={styles.detalhes}>
          {loading && <p className={styles.loading}>Carregando itens...</p>}

          {!loading && error && <p className={styles.error}>{error}</p>}

          {!loading &&
            !error &&
            produtos.map((produto) => (
              <CardPedidoProduto
                key={produto.item_pedido_id_produto}
                produto={produto}
                onComprarNovamente={onComprarNovamente}
              />
            ))}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.notaFiscalButton}
              onClick={() => onVerNotaFiscal?.(pedido.id)}
            >
              Ver Nota Fiscal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
