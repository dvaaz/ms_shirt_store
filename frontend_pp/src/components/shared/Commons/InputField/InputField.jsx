import styles from './InputField.module.css'

export default function InputField({ label, icon, rightIcon, error, full = true, className = '', ...props
}) {
  return (
    <div className={`${styles.group} ${full ? styles.full : ''} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={`${styles.inputBox} ${error ? styles.error : ''}`}>
        {icon && <span className={styles.icon}>{icon}</span>}

        <input className={styles.input} {...props} />

        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}