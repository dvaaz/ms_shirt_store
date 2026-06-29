import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import Logo from '../../../assets/Logo_ShirtStore.svg'
import { HomeIcon, BoxIcon, StarIcon, CartIcon, UserIcon, LogoutIcon, HelpIcon } from '../../../assets/icons/Icons'
import styles from './Navbar.module.css'

// Navbar das telas autenticadas (ver perfil-adm.png).
// O link "Admin" só aparece para role === 'admin'.
export default function Navbar({ userName }) {
  const { role, logout } = useAuth()
  const isAdmin = role === 'admin'

  const navLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`.trim()

  return (
    <header className={styles.header}>
      <Link to="/perfil" className={styles.brand}>
        <img src={Logo} alt="ShirtStore" className={styles.logo} />
        <strong>ShirtStore</strong>
      </Link>

      <nav className={styles.nav}>
        <a href="#" className={styles.navLink}>
          <HomeIcon /> Catálogo
        </a>

        {isAdmin && (
          <a href="#" className={styles.navLink}>
            <BoxIcon /> Meus Pedidos
          </a>
        )}

        {isAdmin && (
          <NavLink to="/admin" className={navLinkClass}>
            <StarIcon /> Admin
          </NavLink>
        )}

        <button type="button" className={styles.cartButton}>
          <CartIcon />
        </button>

        <span className={styles.user}>
          <UserIcon />
          {userName}
        </span>

        <button type="button" onClick={logout} className={styles.logoutButton}>
          <LogoutIcon />
        </button>
      </nav>
    </header>
  )
}
