import styles from './Buttons_Primary.module.css'

export default function ButtonPrimary({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${full ? styles.full : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </button>
  )
}