import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="toast">
      <CheckCircle size={18} />
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  )
}