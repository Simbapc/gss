// src/api/modules/selection.js
import api from "../index";

export const selectTopic = (topicId) =>
  api.post(`/selections/select/${topicId}`);
export const getMySelection = () => api.get("/selections/my-selection");
export const cancelSelection = () => api.delete("/selections/cancel");

// --- 教师API ---
export const fetchPendingSelections = () =>
  api.get("/selections/teacher/pending");
export const fetchApprovedSelections = () =>
  api.get("/selections/teacher/approved");
export const reviewSelection = (selectionId, decision) =>
  api.patch(`/selections/teacher/review/${selectionId}`, { decision });