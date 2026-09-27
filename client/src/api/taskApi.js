import api from './client';

export const taskApi = {
  // Query tasks with filters (boardId, listId, status, priority, assignedTo, search, page, limit)
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTasksByList: (listId) => api.get(`/lists/${listId}/tasks`),
  getTaskById: (taskId) => api.get(`/tasks/${taskId}`),
  createTask: (listId, data) => api.post(`/lists/${listId}/tasks`, data),
  updateTask: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  updateTaskStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  assignTask: (taskId, userId) => api.patch(`/tasks/${taskId}/assign`, { userId }),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`)
};
