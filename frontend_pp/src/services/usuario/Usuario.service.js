import authService from '../login/Auth.service'

const usuarioService = {
  buscarUsuarioLogado() {
    return authService.get('/usuarios/me').then(({ data }) => data)
  },
}

export default usuarioService
