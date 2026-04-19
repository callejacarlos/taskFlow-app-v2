import React from 'react'

// Patrón Composite: Componente base
export class TaskComponent {
  constructor(data) {
    this.data = data
  }

  getDetails() {
    throw new Error('getDetails() debe implementarse en la subclase')
  }

  render() {
    throw new Error('render() debe implementarse en la subclase')
  }

  isCompleted() {
    throw new Error('isCompleted() debe implementarse en la subclase')
  }

  toggleCompleted() {
    throw new Error('toggleCompleted() debe implementarse en la subclase')
  }
}

// Hoja: Subtarea individual
export class SimpleTask extends TaskComponent {
  constructor(subtask) {
    super(subtask)
  }

  getDetails() {
    return {
      id: this.data._id || this.data.id,
      title: this.data.title,
      completed: this.data.completed || false,
      type: 'subtask'
    }
  }

  isCompleted() {
    return this.data.completed || false
  }

  toggleCompleted() {
    this.data.completed = !this.data.completed
  }

  render(onToggleSubtask, index) {
    const details = this.getDetails()
    return (
      <div
        key={details.id || index}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <input
          type="checkbox"
          checked={details.completed}
          onChange={() => {
            this.toggleCompleted()
            if (onToggleSubtask) onToggleSubtask(index, this.isCompleted())
          }}
          style={{ cursor: 'pointer' }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 14,
            textDecoration: details.completed ? 'line-through' : 'none',
            color: details.completed ? '#9ca3af' : '#374151',
          }}
        >
          {details.title}
        </span>
      </div>
    )
  }
}

// Composite: Grupo de subtareas
export class TaskGroup extends TaskComponent {
  constructor(task) {
    super(task)
    this.children = []
    this.loadSubtasks()
  }

  loadSubtasks() {
    if (this.data.subtasks && Array.isArray(this.data.subtasks)) {
      this.children = this.data.subtasks.map(subtask => new SimpleTask(subtask))
    }
  }

  add(component) {
    this.children.push(component)
  }

  remove(component) {
    this.children = this.children.filter(child => child !== component)
  }

  getChildren() {
    return this.children
  }

  getDetails() {
    const completedCount = this.children.filter(child => child.isCompleted()).length
    return {
      title: this.data.title,
      totalSubtasks: this.children.length,
      completedSubtasks: completedCount,
      progress: this.children.length > 0 ? Math.round((completedCount / this.children.length) * 100) : 0,
      type: 'task'
    }
  }

  isCompleted() {
    return this.children.length > 0 && this.children.every(child => child.isCompleted())
  }

  toggleCompleted() {
    // No aplicable para grupos, pero podría marcar todas las subtareas
  }

  render(onToggleSubtask) {
    const details = this.getDetails()

    return (
      <div style={{ padding: '16px 0' }}>
        {/* Header del grupo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            Subtareas ({details.completedSubtasks}/{details.totalSubtasks})
          </h3>
          <div style={{
            fontSize: 12,
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: 12,
          }}>
            {details.progress}% completado
          </div>
        </div>

        {/* Lista de subtareas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {this.children.length > 0 ? (
            this.children.map((child, index) => child.render(onToggleSubtask, index))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#9ca3af',
              fontSize: 14,
            }}>
              No hay subtareas
            </div>
          )}
        </div>
      </div>
    )
  }
}

// Componente React para usar el Composite
export function TaskCompositeView({ task, onToggleSubtask }) {
  const taskGroup = new TaskGroup(task)
  return taskGroup.render(onToggleSubtask)
}

// Ejemplo de uso
export const exampleTaskWithSubtasks = {
  title: 'Implementar patrón Composite',
  subtasks: [
    { id: '1', title: 'Crear clase base TaskComponent', completed: true },
    { id: '2', title: 'Implementar SimpleTask (hoja)', completed: true },
    { id: '3', title: 'Implementar TaskGroup (composite)', completed: false },
    { id: '4', title: 'Integrar en vista de detalle', completed: false },
  ]
}
