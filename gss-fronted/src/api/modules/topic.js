// src/api/modules/topic.js
import api from "../index";

export const fetchMyTopics = () => api.get("/topics/my-topics");
export const createTopic = (data) => api.post("/topics", data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

// 批量操作API
export const batchCreateTopics = (topics) => api.post("/topics/batch-create", { topics });
export const batchUpdateTopics = (topics) => api.put("/topics/batch-update", { topics });

// export const fetchAvailableTopics = () => api.get("/topics/available");


// =======================================================
// === 学生相关 API (Student-related APIs) ===
// =======================================================

/**
 * 【您需要的函数】
 * 获取所有状态为 'open' 的课题，供学生列表页展示`
 * @returns {Promise}
 */
export const fetchAllOpenTopics = () => api.get('/topics/available');


// =======================================================
// === 选题相关 API (Selection-related APIs) ===
// =======================================================

/**
 * 【您需要的函数】
 * 学生选择一个课题。
 * 注意：从逻辑上讲，这个函数放在 `selection.js` 模块中可能更合适，
 * 但如果它已经在这里并且能正常工作，我们暂时可以保持现状。
 * @param {number} topicId - 学生要选择的课题ID
 * @returns {Promise}
 */
export const selectTopic = (topicId) => api.post(`/selections/select/${topicId}`);
