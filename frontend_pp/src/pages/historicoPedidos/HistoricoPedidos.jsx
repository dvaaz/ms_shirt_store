import { useEffect, useRef, useState } from "react";
import usuarioService from "../../services/usuario/Usuario.service";
import pedidoService from "../../services/pedido/Pedido.service";
import Navbar from "../../components/shared/Navbar/Navbar";
import ModalPedido from "../../components/SetHistoricoPedidos/ModalPedido/index";
import styles from "./HistoricoPedidos.module.css";

const PEDIDOS_POR_PAGINA = 10;

export default function HistoricoPedidos() {
  const [user, setUser] = useState(null);
  const usuarioUuid = user?.usuario_uuid;

  const [todosPedidos, setTodosPedidos] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PEDIDOS_POR_PAGINA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);

  // dados do usuário vêm de GET /usuarios/me, mesmo padrão de Perfil/PerfilAdmin
  useEffect(() => {
    let active = true;
    usuarioService
      .buscarUsuarioLogado()
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // /pedido retorna a lista completa do usuário; a paginação é só visual,
  // resolvida no front via scroll
  useEffect(() => {
    if (!usuarioUuid) return;

    let active = true;
    setLoading(true);
    setError("");

    pedidoService
      .listarPedidos(usuarioUuid)
      .then((data) => {
        if (active) setTodosPedidos(data);
      })
      .catch(() => {
        if (active)
          setError("Não foi possível carregar o histórico de pedidos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [usuarioUuid]);

  const pedidosVisiveis = todosPedidos.slice(0, visibleCount);
  const hasMore = visibleCount < todosPedidos.length;

  // observa o fim da lista para revelar os próximos 10 pedidos já carregados
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((atual) => atual + PEDIDOS_POR_PAGINA);
        }
      },
      { rootMargin: "200px" },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className={styles.page}>
      <Navbar userName={user?.nome ?? ""} />

      <main className={styles.main}>
        <h2 className={styles.heading}>Histórico de Pedidos</h2>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!loading && !error && todosPedidos.length === 0 && (
          <p className={styles.vazio}>Você ainda não fez nenhum pedido.</p>
        )}

        <div className={styles.lista}>
          {pedidosVisiveis.map((pedido) => (
            <ModalPedido
              key={pedido.pedido_uuid}
              pedido={pedido}
              usuarioUuid={usuarioUuid}
            />
          ))}
        </div>

        {loading && <p className={styles.loading}>Carregando pedidos...</p>}

        {!hasMore && todosPedidos.length > 0 && (
          <p className={styles.fim}>Você chegou ao fim do histórico.</p>
        )}

        <div ref={sentinelRef} className={styles.sentinel} />
      </main>
    </div>
  );
}
