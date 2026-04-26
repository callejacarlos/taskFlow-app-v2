import React from 'react'

// Helper function to check if a task is overdue
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

// Base Task Component (wraps TaskCard)
export const BaseTask = (WrappedComponent) => (props) => {
  return <WrappedComponent {...props} />
}

// Abstract Decorator (Higher-Order Component)
export const TaskDecorator = (WrappedComponent) => (props) => {
  return <WrappedComponent {...props} />
}

// Priority Decorator: Highlights urgent tasks
export const PriorityDecorator = (WrappedComponent) => (props) => {
  const { task } = props
  const isUrgent = task.priority === 'URGENTE'

  if (!isUrgent) {
    return <WrappedComponent {...props} />
  }

  return (
    <div
      style={{
        position: 'relative',
        border: '2px solid #EF4444',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
        background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
      }}
    >
      {/* Urgent badge */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#EF4444',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 10,
        }}
      >
        !
      </div>
      <WrappedComponent {...props} />
    </div>
  )
}

// Overdue Decorator: Highlights overdue tasks
export const OverdueDecorator = (WrappedComponent) => (props) => {
  const { task } = props
  const overdue = isOverdue(task.dueDate)

  if (!overdue) {
    return <WrappedComponent {...props} />
  }

  return (
    <div
      style={{
        position: 'relative',
        border: '2px solid #F59E0B',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      }}
    >
      {/* Overdue badge */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '-8px',
          background: '#F59E0B',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 10,
        }}
      >
        VENCIDA
      </div>
      <WrappedComponent {...props} />
    </div>
  )
}

// Function to apply decorators dynamically
export const applyTaskDecorators = (task, BaseComponent) => {
  let DecoratedComponent = BaseComponent

  // Apply Priority Decorator if urgent
  if (task.priority === 'URGENTE') {
    DecoratedComponent = PriorityDecorator(DecoratedComponent)
  }

  // Apply Overdue Decorator if overdue
  if (isOverdue(task.dueDate)) {
    DecoratedComponent = OverdueDecorator(DecoratedComponent)
  }

  return DecoratedComponent
}

// Example usage
export const DecoratedTaskExample = ({ task, BaseComponent }) => {
  const DecoratedComponent = applyTaskDecorators(task, BaseComponent)
  return <DecoratedComponent task={task} />
}
