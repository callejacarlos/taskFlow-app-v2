import api from './api.js'

const makeResult = (success, data = null, error = null) => ({ success, data, error })

const handleError = (context, err) => {
  console.error(`TaskFacade.${context}`, err)
  return makeResult(false, null, err.response?.data?.message || err.message || 'Error en la operación de tareas')
}

export const createTask = async (payload) => {
  try {
    const response = await api.post('/tasks', payload)
    console.log('TaskFacade.createTask', response.data)
    return makeResult(true, response.data, null)
  } catch (err) {
    return handleError('createTask', err)
  }
}

export const getTasks = async (params = {}) => {
  try {
    const response = await api.get('/tasks', { params })
    console.log('TaskFacade.getTasks', params)
    return makeResult(true, response.data, null)
  } catch (err) {
    return handleError('getTasks', err)
  }
}

export const updateTask = async (taskId, payload) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, payload)
    console.log('TaskFacade.updateTask', taskId)
    return makeResult(true, response.data, null)
  } catch (err) {
    return handleError('updateTask', err)
  }
}

export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}`)
    console.log('TaskFacade.deleteTask', taskId)
    return makeResult(true, response.data, null)
  } catch (err) {
    return handleError('deleteTask', err)
  }
}
