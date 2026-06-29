import styles from './Toast.module.css'

export default function Toast({ visible, title, message, type, onClose}) {
  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <div
        className={`
          ${styles.toast}
          ${styles[type]}
        `}
      >
        <h3>{title}</h3>

        <p>{message}</p>

        <button
          onClick={onClose}
          className={styles.button}
        >
          Fechar
        </button>
      </div>
    </div>
  )
}