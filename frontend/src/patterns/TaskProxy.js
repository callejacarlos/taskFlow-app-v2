import { createTask as facadeCreateTask, getTasks as facadeGetTasks, updateTask as facadeUpdateTask, deleteTask as facadeDeleteTask } from '../services/TaskFacade.js'

// Proxy para TaskFacade con validaciones, logs y cache
class TaskProxy {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  // Validaciones básicas
  validateTaskPayload(payload, operation) {
    if (!payload) {
      throw new Error(`Payload requerido para ${operation}`)
    }

    if (operation === 'create' || operation === 'update') {
      if (!payload.title || payload.title.trim().length === 0) {
        throw new Error('El título de la tarea es obligatorio')
      }

      if (payload.title && payload.title.length > 200) {
        throw new Error('El título no puede exceder 200 caracteres')
      }

      if (payload.description && payload.description.length > 1000) {
        throw new Error('La descripción no puede exceder 1000 caracteres')
      }
    }

    if (operation === 'update' || operation === 'delete') {
      if (!payload.taskId && !payload) {
        throw new Error('ID de tarea requerido')
      }
    }
  }

  // Logs de operaciones
  log(operation, details) {
    const timestamp = new Date().toISOString()
    console.log(`[TaskProxy] ${timestamp} - ${operation}:`, details)
  }

  // Cache management
  getCacheKey(params = {}) {
    return JSON.stringify(params)
  }

  getCachedResult(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.log('CACHE_HIT', { key, age: Date.now() - cached.timestamp })
      return cached.data
    }
    if (cached) {
      this.cache.delete(key) // Cache expirado
    }
    return null
  }

  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clearCache() {
    this.cache.clear()
    this.log('CACHE_CLEARED', 'All cached results cleared')
  }

  invalidateCacheByTaskId(taskId) {
    // Invalida cache que podría contener esta tarea
    for (const [key, value] of this.cache.entries()) {
      if (value.data?.tasks?.some(task => task._id === taskId)) {
        this.cache.delete(key)
        this.log('CACHE_INVALIDATED', { taskId, key })
      }
    }
  }

  // Métodos proxyados
  async createTask(payload) {
    try {
      this.validateTaskPayload(payload, 'create')
      this.log('CREATE_TASK_START', { title: payload.title })

      const result = await facadeCreateTask(payload)

      if (result.success) {
        this.clearCache() // Invalida todo el cache al crear nueva tarea
        this.log('CREATE_TASK_SUCCESS', { taskId: result.data?.task?._id })
      } else {
        this.log('CREATE_TASK_ERROR', result.error)
      }

      return result
    } catch (err) {
      this.log('CREATE_TASK_VALIDATION_ERROR', err.message)
      return { success: false, data: null, error: err.message }
    }
  }

  async getTasks(params = {}) {
    try {
      this.log('GET_TASKS_START', params)

      const cacheKey = this.getCacheKey(params)
      const cachedResult = this.getCachedResult(cacheKey)

      if (cachedResult) {
        return cachedResult
      }

      const result = await facadeGetTasks(params)

      if (result.success) {
        this.setCachedResult(cacheKey, result)
        this.log('GET_TASKS_SUCCESS', { count: result.data?.tasks?.length || 0 })
      } else {
        this.log('GET_TASKS_ERROR', result.error)
      }

      return result
    } catch (err) {
      this.log('GET_TASKS_ERROR', err.message)
      return { success: false, data: null, error: err.message }
    }
  }

  async updateTask(taskId, payload) {
    try {
      this.validateTaskPayload({ taskId, ...payload }, 'update')
      this.log('UPDATE_TASK_START', { taskId, changes: Object.keys(payload) })

      const result = await facadeUpdateTask(taskId, payload)

      if (result.success) {
        this.invalidateCacheByTaskId(taskId) // Invalida cache que contenga esta tarea
        this.log('UPDATE_TASK_SUCCESS', { taskId })
      } else {
        this.log('UPDATE_TASK_ERROR', result.error)
      }

      return result
    } catch (err) {
      this.log('UPDATE_TASK_VALIDATION_ERROR', err.message)
      return { success: false, data: null, error: err.message }
    }
  }

  async deleteTask(taskId) {
    try {
      this.validateTaskPayload({ taskId }, 'delete')
      this.log('DELETE_TASK_START', { taskId })

      const result = await facadeDeleteTask(taskId)

      if (result.success) {
        this.invalidateCacheByTaskId(taskId) // Invalida cache que contenga esta tarea
        this.log('DELETE_TASK_SUCCESS', { taskId })
      } else {
        this.log('DELETE_TASK_ERROR', result.error)
      }

      return result
    } catch (err) {
      this.log('DELETE_TASK_VALIDATION_ERROR', err.message)
      return { success: false, data: null, error: err.message }
    }
  }
}

// Instancia singleton del proxy
const taskProxy = new TaskProxy()

// Exporta los métodos proxyados
export const createTask = (payload) => taskProxy.createTask(payload)
export const getTasks = (params) => taskProxy.getTasks(params)
export const updateTask = (taskId, payload) => taskProxy.updateTask(taskId, payload)
export const deleteTask = (taskId) => taskProxy.deleteTask(taskId)

// Exporta la instancia para acceso directo si es necesario
export default taskProxy
