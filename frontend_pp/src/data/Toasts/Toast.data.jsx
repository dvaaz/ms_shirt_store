export const toastPresets = [
  {
    id: 'login-error',
    title: 'Erro ao autenticar',
    message: 'Email ou senha inválidos.',
    type: 'error',
  },

  {
    id: 'login-success',
    title: 'Login realizado',
    message: 'Bem-vindo ao sistema.',
    type: 'success',
  },

  {
    id: 'cadastro-success',
    title: 'Cadastro realizado',
    message: 'Sua conta foi criada com sucesso.',
    type: 'success',
  },

  {
    id: 'cadastro-error',
    title: 'Erro ao cadastrar',
    message: 'Não foi possível criar sua conta.',
    type: 'error',
  },

  {
    id: 'senha-error',
    title: 'Senhas diferentes',
    message: 'As senhas informadas não coincidem.',
    type: 'warning',
  },
]

export function getToastPreset(id) {
  return toastPresets.find(
    (toast) => toast.id === id
  )
}