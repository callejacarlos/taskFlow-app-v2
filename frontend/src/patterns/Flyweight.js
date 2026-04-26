// Flyweight para metadata de tareas compartida por prioridad

export class TaskMeta {
  constructor(priority, bg, color, dot, gradient) {
    this.priority = priority
    this.bg = bg
    this.color = color
    this.dot = dot
    this.gradient = gradient
  }
}

export class TaskMetaFactory {
  static cache = new Map()

  static definitions = {
    URGENTE: { bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444', gradient:'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' },
    ALTA:    { bg:'#FFEDD5', color:'#9A3412', dot:'#F97316', gradient:'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)' },
    MEDIA:   { bg:'#FEF3C7', color:'#92400E', dot:'#F59E0B', gradient:'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' },
    BAJA:    { bg:'#DBEAFE', color:'#1E40AF', dot:'#3B82F6', gradient:'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)' },
  }

  static getMeta(priority) {
    const key = (priority || 'MEDIA').toUpperCase()
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    const def = this.definitions[key] || this.definitions.MEDIA
    const meta = new TaskMeta(key, def.bg, def.color, def.dot, def.gradient)
    this.cache.set(key, meta)
    return meta
  }
}

export const getTaskMeta = (priority) => TaskMetaFactory.getMeta(priority)
