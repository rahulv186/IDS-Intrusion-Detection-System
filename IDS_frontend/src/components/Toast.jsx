import { useEffect } from 'react'

export default function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(id)
  }, [onDismiss, duration])

  return (
    <div
      className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium shadow-lg animate-fade-in"
      role="alert"
    >
      {message}
    </div>
  )
}
