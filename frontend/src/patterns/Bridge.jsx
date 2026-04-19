import React from 'react'
import TaskCard from '../components/tasks/TaskCard.jsx'

// Implementador: Renderer
export class Renderer {
  render(task) {
    throw new Error('Renderer.render() debe implementarse en la subclase')
  }
}

// Renderer concreto 1: lista simple
export class ListRenderer extends Renderer {
  constructor(props = {}) {
    super()
    this.props = props
  }

  render(task) {
    return (
      <div
        draggable={true}
        onClick={this.props.onClick ? () => this.props.onClick(task) : undefined}
        onDragStart={(e) => {
          if (this.props.onMove) {
            e.dataTransfer.setData('application/json', JSON.stringify({
              taskId: task._id,
              fromColumn: task.column,
            }))
            e.dataTransfer.effectAllowed = 'move'
          }
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderBottom: '1px solid #e5e7eb',
          background: '#ffffff',
          cursor: this.props.onClick ? 'pointer' : 'grab',
          userSelect: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{task.title}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{task.description}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#374151', textTransform: 'uppercase' }}>
            {task.priority || 'Normal'}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            {task.type || 'TAREA'}
          </span>
        </div>
      </div>
    )
  }
}

// Renderer concreto 2: tarjeta
export class CardRenderer extends Renderer {
  constructor(props = {}) {
    super()
    this.props = props
  }

  render(task) {
    return (
      <TaskCard
        task={task}
        columns={this.props.columns}
        onClick={this.props.onClick}
        onMove={this.props.onMove}
        onDelete={this.props.onDelete}
        onClone={this.props.onClone}
      />
    )
  }
}

// Abstracción: TaskControl
export class TaskControl {
  constructor(task, renderer) {
    this.task = task
    this.renderer = renderer
  }

  render() {
    return this.renderer.render(this.task)
  }
}

// Abstracción refinada 1: tarea simple
export class SimpleTask extends TaskControl {
  constructor(task, renderer) {
    super(task, renderer)
  }
}

// Abstracción refinada 2: tarea urgente
export class UrgentTask extends TaskControl {
  constructor(task, renderer) {
    super(task, renderer)
  }

  render() {
    const content = super.render()
    if (this.renderer instanceof CardRenderer) {
      return content
    }

    return (
      <div style={{
        border: '1px solid #ef4444',
        borderRadius: 16,
        background: '#fff1f2',
        padding: 4,
      }}>
        {content}
      </div>
    )
  }
}

// Ejemplo simple de uso con React
export function TaskBridgeExample({ task, view = 'list', onClick, onMove, onDelete, onClone, columns }) {
  const renderer = view === 'card'
    ? new CardRenderer({ onClick, onMove, onDelete, onClone, columns })
    : new ListRenderer({ onClick, onMove })
  const taskControl = task.priority === 'URGENTE'
    ? new UrgentTask(task, renderer)
    : new SimpleTask(task, renderer)

  return taskControl.render()
}

// Ejemplo de datos por defecto para pruebas
export const exampleTask = {
  title: 'Revisar PR de TaskFlow',
  description: 'Verificar que la nueva notificación funcione correctamente.',
  priority: 'URGENTE',
  status: 'En revisión',
}
