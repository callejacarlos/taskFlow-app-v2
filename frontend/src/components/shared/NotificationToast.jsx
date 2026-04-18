import { useState, useEffect } from 'react'

const NotificationToast = ({ message, type = 'success', linkUrl, linkLabel, onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Esperar animación de salida
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const icons = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
  }

  const colors = {
    success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: '#10B981' },
    error: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: '#EF4444' },
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: '#3B82F6' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '#F59E0B' }
  }

  const color = colors[type] || colors.success

  return (
    <div
      style={{
        position: 'fixed',
        top: visible ? '20px' : '-100px',
        right: '20px',
        zIndex: 1000,
        minWidth: '320px',
        maxWidth: '500px',
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color.icon}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icons[type]} />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, color: color.text }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        {linkUrl && (
          <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: '1.4' }}>
            <a href={linkUrl} target="_blank" rel="noreferrer" style={{ color: color.icon, textDecoration: 'underline' }}>
              {linkLabel || 'Ver preview del email'}
            </a>
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          color: color.text,
          opacity: 0.7,
          transition: 'opacity 0.2s',
          flexShrink: 0,
          marginTop: '-2px'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default NotificationToast