import api from './client';

export const boardApi = {
  getBoards: () => api.get('/boards'),
  getBoardById: (boardId) => api.get(`/boards/${boardId}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (boardId, data) => api.patch(`/boards/${boardId}`, data),
  deleteBoard: (boardId) => api.delete(`/boards/${boardId}`),
  addMember: (boardId, data) => api.post(`/boards/${boardId}/members`, data),
  removeMember: (boardId, userId) => api.delete(`/boards/${boardId}/members/${userId}`)
};
