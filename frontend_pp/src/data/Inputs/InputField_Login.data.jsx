import { MailIcon, LockIcon } from '../../assets/icons/Icons'

export const loginInputPresets = [
  {
    id: 'email',
    label: 'Email',
    name: 'email',
    type: 'email',
    placeholder: 'seu@email.com',
    icon: <MailIcon />,
  },
  {
    id: 'senha',
    label: 'Senha',
    name: 'senha',
    type: 'password',
    placeholder: '••••••••',
    icon: <LockIcon />,
  },
]