import {
  UserIcon,
  MailIcon,
  IdIcon,
  LockIcon,
} from '../../assets/icons/Icons'

export const cadastroInputPresets = [
  {
    id: 'nome',
    label: 'Nome',
    name: 'nome',
    type: 'text',
    placeholder: 'Digite seu nome',
    icon: <UserIcon />,
  },
  {
    id: 'sobrenome',
    label: 'Sobrenome',
    name: 'sobrenome',
    type: 'text',
    placeholder: 'Digite seu sobrenome',
    icon: <UserIcon />,
  },
  {
    id: 'email',
    label: 'Email',
    name: 'email',
    type: 'email',
    placeholder: 'seu@email.com',
    icon: <MailIcon />,
  },
  {
    id: 'cpf',
    label: 'CPF',
    name: 'cpf',
    type: 'text',
    placeholder: '000.000.000-00',
    icon: <IdIcon />,
  },
  {
    id: 'senha',
    label: 'Senha',
    name: 'senha',
    type: 'password',
    placeholder: '••••••••',
    icon: <LockIcon />,
  },
  {
    id: 'confirmarSenha',
    label: 'Confirmar senha',
    name: 'confirmarSenha',
    type: 'password',
    placeholder: '••••••••',
    icon: <LockIcon />,
  },
]