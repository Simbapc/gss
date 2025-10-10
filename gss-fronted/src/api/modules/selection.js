// src/api/modules/selection.js
import api from '../index';

export const selectTopic = (topicId) => api.post(`/selections/select/${topicId}`);
export const getMySelection = () => api.get('/selections/my-selection');
export const cancelSelection = () => api.delete('/selections/cancel');