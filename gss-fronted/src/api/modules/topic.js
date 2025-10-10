// src/api/modules/topic.js
import api from "../index";

export const fetchMyTopics = () => api.get("/topics/my-topics");
export const createTopic = (data) => api.post("/topics", data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

export const fetchAvailableTopics = () => api.get("/topics/available");
