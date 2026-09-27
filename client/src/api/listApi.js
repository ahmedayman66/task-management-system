import api from './client';

export const listApi = {
  getListsByBoard: (boardId) => api.get(`/boards/${boardId}/lists`),
  createList: (boardId, data) => api.post(`/boards/${boardId}/lists`, data),
  updateList: (listId, data) => api.patch(`/lists/${listId}`, data),
  deleteList: (listId) => api.delete(`/lists/${listId}`)
};
