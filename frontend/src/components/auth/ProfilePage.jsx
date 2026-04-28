import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const NOTIFICATION_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
]

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: '',
    role: '',
    preferredNotificationMethod: 'email',
    telegramUserId: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        role: user.role || 'DEVELOPER',
        preferredNotificationMethod: user.preferredNotificationMethod || 'email',
        telegramUserId: user.telegramUserId || '',
      })
    }
  }, [user])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await updateProfile({
        name: form.name,
        role: form.role,
        preferredNotificationMethod: form.preferredNotificationMethod,
        telegramUserId: form.preferredNotificationMethod === 'telegram' ? form.telegramUserId : null,
      })
      setMessage('Preferencias guardadas correctamente.')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 12, fontSize: 28, color: 'var(--text-primary)' }}>Perfil</h1>
      <p style={{ color:'var(--text-secondary)', marginBottom: 24 }}>Configura tu método de notificación favorito para recibir alertas de tareas.</p>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <select className="select" name="role" value={form.role} onChange={handleChange}>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="form-group">
            <label>Método de notificación</label>
            <select
              className="select"
              name="preferredNotificationMethod"
              value={form.preferredNotificationMethod}
              onChange={handleChange}
            >
              {NOTIFICATION_METHODS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {form.preferredNotificationMethod === 'telegram' && (
            <div className="form-group">
              <label>ID de Telegram</label>
              <input
                className="input"
                name="telegramUserId"
                value={form.telegramUserId}
                onChange={handleChange}
                placeholder="123456789"
                required
              />
              <small style={{ color:'var(--text-secondary)', marginTop:4, display:'block' }}>
                Si escoges Telegram, ingresa tu ID de usuario para recibir las notificaciones.
              </small>
            </div>
          )}

          {message && <p className="success-msg" style={{ marginBottom:12 }}>{message}</p>}
          {error && <p className="error-msg" style={{ marginBottom:12 }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'10px' }}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
