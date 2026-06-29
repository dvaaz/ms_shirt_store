import authService from '../login/Auth.service'

const produtoService = {
  // GET /produto/picture/{produtoId} — imagem binária do produto
  buscarImagem(produtoId) {
    return authService
      .get(`/produto/picture/${produtoId}`, { responseType: 'blob' })
      .then(({ data }) => URL.createObjectURL(data))
  },
}

export default produtoService
