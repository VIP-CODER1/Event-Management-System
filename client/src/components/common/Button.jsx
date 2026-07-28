export default function Button({ children, onClick, className, disabled, type }) {
  return (
    <button
      type={type || 'button'}
      className={'btn ' + (className || '')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
