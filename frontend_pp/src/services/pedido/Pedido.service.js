import authService from '../login/Auth.service'

const pedidoService = {
  // GET /pedido — lista completa de pedidos do usuário autenticado
  listarPedidos(usuarioUuid) {
    return authService
      .get('/pedido', { headers: { usuario_uuid: usuarioUuid } })
      .then(({ data }) => data)
  },

  // GET /item-pedido/{pedidoUuid} — itens (produtos) de um pedido
  listarItensPedido(pedidoUuid, usuarioUuid) {
    return authService
      .get(`/item-pedido/${pedidoUuid}`, {
        headers: { usuario_uuid: usuarioUuid },
      })
      .then(({ data }) => data)
  },
}

export default pedidoService
