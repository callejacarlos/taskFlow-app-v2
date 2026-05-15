import React from 'react'

/**
 * UTILITY: Check if a task is overdue
 */
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

/**
 * INTERFACE: TaskCardComponent
 * Matches the UML diagram. Defines the render method.
 */
class TaskCardComponent {
  render() {
    throw new Error("Method 'render()' must be implemented.")
  }
}

/**
 * CONCRETE COMPONENT: BaseTaskCard
 * The basic implementation of the task card.
 */
class BaseTaskCard extends TaskCardComponent {
  constructor(BaseComponent, props) {
    super()
    this.BaseComponent = BaseComponent
    this.props = props
  }

  render() {
    const { BaseComponent, props } = this
    return <BaseComponent {...props} />
  }
}

/**
 * ABSTRACT DECORATOR: TaskDecoratorBase
 * Implements the same interface and holds a reference to a component.
 */
class TaskDecoratorBase extends TaskCardComponent {
  constructor(component) {
    super()
    this.component = component
  }

  // FIX: Delegar props al componente envuelto
  get props() {
    return this.component.props
  }

  render() {
    // Default behavior: just delegate to the wrapped component
    return this.component.render()
  }
}

/**
 * CONCRETE DECORATOR: PriorityDecorator
 * Adds visual emphasis for urgent tasks.
 */
export class PriorityDecorator extends TaskDecoratorBase {
  render() {
    // FIX: usar this.props en lugar de this.component.props
    const { task } = this.props

    // Protección extra
    if (!task) {
      return super.render()
    }

    const isUrgent = task.priority === 'URGENTE'

    if (!isUrgent) {
      return super.render()
    }

    return (
      <div
        style={{
          position: 'relative',
          borderRadius: '12px',
          padding: '2px',
          background: 'linear-gradient(135deg, #FF4D4D 0%, #F97316 100%)',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)',
          animation: 'pulse-border 2s infinite ease-in-out',
        }}
      >
        <style>{`
          @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>

        {/* Urgent Badge */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '10px',
            background: '#EF4444',
            color: 'white',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '9px',
            fontWeight: '800',
            letterSpacing: '0.5px',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1.5px solid white'
          }}
        >
          <span style={{ fontSize: '11px' }}>⚡</span> URGENTE
        </div>

        <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
          {super.render()}
        </div>
      </div>
    )
  }
}

/**
 * CONCRETE DECORATOR: OverdueDecorator
 * Adds visual emphasis for overdue tasks.
 */
export class OverdueDecorator extends TaskDecoratorBase {
  render() {
    // FIX: usar this.props en lugar de this.component.props
    const { task } = this.props

    // Protección extra
    if (!task) {
      return super.render()
    }

    const overdue = isOverdue(task.dueDate)

    if (!overdue) {
      return super.render()
    }

    return (
      <div
        style={{
          position: 'relative',
          borderRadius: '12px',
          border: '2px dashed #F59E0B',
          background: 'rgba(245, 158, 11, 0.03)',
        }}
      >
        {/* Overdue Label */}
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#F59E0B',
            color: 'white',
            borderRadius: '4px',
            padding: '1px 8px',
            fontSize: '9px',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
            whiteSpace: 'nowrap'
          }}
        >
          ⏰ VENCIDA
        </div>

        {super.render()}
      </div>
    )
  }
}

/**
 * FACTORY FUNCTION: applyTaskDecorators
 * Dynamically constructs the decorator chain.
 * This is the entry point used by other components.
 */
export const applyTaskDecorators = (task, BaseComponent) => {
  // Returns a functional component to be used in React
  return (props) => {
    // 1. Start with the base component
    let component = new BaseTaskCard(BaseComponent, props)

    // 2. Wrap with PriorityDecorator if needed
    if (task?.priority === 'URGENTE') {
      component = new PriorityDecorator(component)
    }

    // 3. Wrap with OverdueDecorator if needed
    if (isOverdue(task?.dueDate)) {
      component = new OverdueDecorator(component)
    }

    // 4. Execute the render chain
    return component.render()
  }
}

/**
 * EXAMPLE COMPONENT: DecoratedTaskExample
 * Demonstrates usage of the decorator pattern.
 */
export const DecoratedTaskExample = ({ task, BaseComponent }) => {
  const DecoratedComponent = applyTaskDecorators(task, BaseComponent)
  return <DecoratedComponent task={task} />
}