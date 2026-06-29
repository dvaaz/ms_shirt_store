import authService from '../login/Auth.service'

const carrinhoService = {
  // POST /carrinho — adiciona um produto ao carrinho do usuário
  adicionarItem({ produtoId, quantidade }, usuarioUuid) {
    return authService.post(
      '/carrinho',
      { produtoId, quantidade },
      { headers: { usuario_uuid: usuarioUuid } },
    )
  },
}

export default carrinhoService
