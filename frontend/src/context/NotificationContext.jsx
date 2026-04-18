import { createContext, useContext, useState } from 'react'
import NotificationToast from '../components/shared/NotificationToast.jsx'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'success', duration = 5000, linkUrl = null, linkLabel = null) => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type, duration, linkUrl, linkLabel }

    setNotifications(prev => [...prev, notification])

    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Métodos convenientes
  const success = (message, duration, linkUrl = null, linkLabel = null) => addNotification(message, 'success', duration, linkUrl, linkLabel)
  const error = (message, duration, linkUrl = null, linkLabel = null) => addNotification(message, 'error', duration, linkUrl, linkLabel)
  const info = (message, duration, linkUrl = null, linkLabel = null) => addNotification(message, 'info', duration, linkUrl, linkLabel)
  const warning = (message, duration, linkUrl = null, linkLabel = null) => addNotification(message, 'warning', duration, linkUrl, linkLabel)

  return (
    <NotificationContext.Provider value={{
      success,
      error,
      info,
      warning,
      addNotification,
      removeNotification
    }}>
      {children}

      {/* Renderizar todas las notificaciones */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          linkUrl={notification.linkUrl}
          linkLabel={notification.linkLabel}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  )
}