<template>
  <div class="page-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">我的课题管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreate" class="btn-primary">
          <el-icon><Plus /></el-icon>
          新增课题
        </el-button>
        <el-button type="success" @click="handleBatchCreate" class="btn-success">
          <el-icon><DocumentAdd /></el-icon>
          批量新增
        </el-button>
        <el-button type="warning" @click="handleBatchEdit" class="btn-warning">
          <el-icon><Edit /></el-icon>
          批量编辑
        </el-button>
      </div>
    </div>

    <!-- 课题列表表格 -->
    <!-- 【阶段五 优化】: 将 @row-click 从 handleEdit 改为 handleRowClick -->
    <el-table :data="topics" style="width: 100%" border @row-click="handleRowClick">
      <el-table-column prop="title" label="课题标题" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'open' ? 'success' : 'info'">
            {{ scope.row.status === 'open' ? '开放中' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <!-- 阻止事件冒泡，防止点击删除也触发 handleRowClick -->
          <el-popconfirm title="确定要删除此课题吗?" @confirm.stop="handleDelete(scope.row.id)">
            <template #reference>
              <el-button @click.stop size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 【阶段五 优化】: 新增的课题详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="50%">
      <div v-if="selectedTopic">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课题标题">{{ selectedTopic.title }}</el-descriptions-item>
          <el-descriptions-item label="课题描述">
            <div style="white-space: pre-wrap;">{{ selectedTopic.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedTopic.status === 'open' ? 'success' : 'info'">
              {{ selectedTopic.status === 'open' ? '开放中' : '已关闭' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="switchToEditMode">编 辑</el-button>
      </template>
    </el-dialog>

    <!-- 原有的新增/编辑课题对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" :class="['topic-dialog']">
      <el-form :model="form" :label-width="formLabelWidth">
        <el-form-item label="课题标题">
          <el-input v-model="form.title" placeholder="请输入课题标题" />
        </el-form-item>
        <el-form-item label="课题描述">
          <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入课题描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="btn-cancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" class="btn-submit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量新增课题对话框 -->
    <el-dialog v-model="batchCreateDialogVisible" title="批量新增课题" width="80%">
      <div style="margin-bottom: 15px;">
        <el-button type="primary" @click="addBatchTopic" size="small">添加课题</el-button>
        <span style="margin-left: 10px; color: #666;">当前共 {{ batchTopics.length }} 个课题</span>
      </div>

      <div v-for="(topic, index) in batchTopics" :key="index"
        style="margin-bottom: 20px; padding: 15px; border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0;">课题 {{ index + 1 }}</h4>
          <el-button @click="removeBatchTopic(index)" type="danger" size="small"
            v-if="batchTopics.length > 1">删除</el-button>
        </div>
        <el-form :model="topic" label-width="80px">
          <el-form-item label="课题标题">
            <el-input v-model="topic.title" placeholder="请输入课题标题" />
          </el-form-item>
          <el-form-item label="课题描述">
            <el-input v-model="topic.description" type="textarea" :rows="3" placeholder="请输入课题描述" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="topic.status">
              <el-option label="开放中" value="open" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="batchCreateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCreateSubmit">批量创建</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑课题对话框 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑课题" width="80%">
      <div style="margin-bottom: 15px;">
        <span style="color: #666;">当前共 {{ batchTopics.length }} 个课题</span>
      </div>

      <div v-for="(topic, index) in batchTopics" :key="topic.id"
        style="margin-bottom: 20px; padding: 15px; border: 1px solid #e4e7ed; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0;">课题 {{ index + 1 }} (ID: {{ topic.id }})</h4>
        <el-form :model="topic" label-width="80px">
          <el-form-item label="课题标题">
            <el-input v-model="topic.title" placeholder="请输入课题标题" />
          </el-form-item>
          <el-form-item label="课题描述">
            <el-input v-model="topic.description" type="textarea" :rows="3" placeholder="请输入课题描述" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="topic.status">
              <el-option label="开放中" value="open" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSubmit">批量更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { fetchMyTopics, createTopic, updateTopic, deleteTopic, batchCreateTopics, batchUpdateTopics } from '../../api/modules/topic';
import { ElMessage } from 'element-plus';
import { Plus, DocumentAdd, Edit } from '@element-plus/icons-vue';

// 响应式标签宽度
const formLabelWidth = computed(() => {
  return window.innerWidth < 768 ? '70px' : '80px';
});

// --- 原有状态 ---
const topics = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = reactive({
  id: null,
  title: '',
  description: '',
});

// --- 【阶段五 优化】: 新增状态 ---
const detailDialogVisible = ref(false); // 控制详情对话框的显示
const selectedTopic = ref(null); // 存储当前点击的课题数据

const loadTopics = async () => {
  loading.value = true;
  try {
    const res = await fetchMyTopics();
    topics.value = res.data;
  } catch (error) {
    console.error("加载课题失败:", error);
  } finally {
    loading.value = false;
  }
};
onMounted(loadTopics);

const resetForm = () => {
  form.id = null;
  form.title = '';
  form.description = '';
};

// --- 【阶段五 优化】: 新增的行点击处理函数 ---
const handleRowClick = (row) => {
  // 如果课题已关闭，可能不允许编辑，这里可以加逻辑
  // if (row.status === 'closed') { ... }
  selectedTopic.value = row;
  detailDialogVisible.value = true;
};

// --- 【阶段五 优化】: 新增的从详情切换到编辑模式的函数 ---
const switchToEditMode = () => {
  if (selectedTopic.value) {
    handleEdit(selectedTopic.value); // 调用已有的 handleEdit 函数
    detailDialogVisible.value = false; // 关闭详情对话框
  }
};

const handleCreate = () => {
  resetForm();
  dialogTitle.value = '新增课题';
  dialogVisible.value = true;
};

// handleEdit 现在主要由 switchToEditMode 调用，但保持不变
const handleEdit = (row) => {
  resetForm();
  form.id = row.id;
  form.title = row.title;
  form.description = row.description;
  dialogTitle.value = '编辑课题';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (form.id) { // 编辑
      await updateTopic(form.id, { title: form.title, description: form.description });
      ElMessage.success('更新成功');
    } else { // 创建
      await createTopic({ title: form.title, description: form.description });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    await loadTopics();
  } catch (error) {
    console.error("提交失败:", error);
  }
};

const handleDelete = async (topicId) => {
  try {
    await deleteTopic(topicId);
    ElMessage.success('删除成功');
    await loadTopics();
  } catch (error) {
    console.error("删除失败:", error);
    const message = error.response?.data?.message || '删除失败，可能已有学生选择该课题';
    ElMessage.error(message);
  }
};

// --- 批量操作相关函数 ---
const batchCreateDialogVisible = ref(false);
const batchEditDialogVisible = ref(false);
const batchTopics = ref([]);

// 批量新增课题
const handleBatchCreate = () => {
  batchTopics.value = [
    { title: '', description: '', status: 'open' },
    { title: '', description: '', status: 'open' },
    { title: '', description: '', status: 'open' }
  ];
  batchCreateDialogVisible.value = true;
};

// 批量编辑课题
const handleBatchEdit = () => {
  batchTopics.value = topics.value.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    status: topic.status
  }));
  batchEditDialogVisible.value = true;
};

// 添加新的课题行
const addBatchTopic = () => {
  batchTopics.value.push({ title: '', description: '', status: 'open' });
};

// 移除课题行
const removeBatchTopic = (index) => {
  batchTopics.value.splice(index, 1);
};

// 提交批量新增
const handleBatchCreateSubmit = async () => {
  try {
    // 过滤掉空标题的课题
    const validTopics = batchTopics.value.filter(topic => topic.title.trim());

    if (validTopics.length === 0) {
      ElMessage.warning('请至少填写一个有效的课题标题');
      return;
    }

    const response = await batchCreateTopics(validTopics);
    ElMessage.success(response.data.message);
    batchCreateDialogVisible.value = false;
    await loadTopics();
  } catch (error) {
    console.error("批量新增失败:", error);
    ElMessage.error(error.response?.data?.message || '批量新增失败');
  }
};

// 提交批量编辑
const handleBatchEditSubmit = async () => {
  try {
    const response = await batchUpdateTopics(batchTopics.value);

    ElMessage.success(response.data.message);

    // 显示详细的处理结果
    if (response.data.results.failed > 0) {
      ElMessage.warning(`部分课题更新失败: ${response.data.results.errors.join('; ')}`);
    }

    batchEditDialogVisible.value = false;
    await loadTopics();
  } catch (error) {
    console.error("批量编辑失败:", error);
    ElMessage.error(error.response?.data?.message || '批量编辑失败');
  }
};
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-success,
.btn-warning {
  display: flex;
  align-items: center;
  gap: 6px;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.el-table :deep(.el-table__row) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.el-table :deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

.el-table :deep(.el-table__header) {
  background-color: #f8fafc;
}

.el-table :deep(.el-table__cell) {
  padding: 12px 16px;
}

/* 解决描述内容过长时不换行的问题 */
.el-descriptions__content {
  white-space: pre-wrap;
}

/* 批量操作样式优化 */
.batch-topic-item {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.batch-topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.batch-topic-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* 响应式设计 - 移动端优化 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }
  
  .page-title {
    font-size: 20px;
    text-align: center;
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  /* 修复 Element Plus 默认的按钮间距 */
  .action-buttons :deep(.el-button + .el-button) {
    margin-left: 0 !important;
  }
  
  .btn-primary,
  .btn-success,
  .btn-warning {
    width: 100%;
    justify-content: center;
    font-size: 13px;
    padding: 8px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .el-table {
    font-size: 14px;
  }
  
  .el-table :deep(.el-table__cell) {
    padding: 8px 12px;
  }
  
  .el-table :deep(.el-table__header .el-table__cell) {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  /* 移动端表格列宽调整 */
  .el-table :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }
  
  /* 移动端对话框优化 */
  .el-dialog {
    width: 95% !important;
    margin: 2% auto !important;
  }
  
  .el-dialog__body {
    padding: 16px;
  }
  
  .el-form-item__label {
    font-size: 14px;
  }
  
  .el-input,
  .el-textarea,
  .el-select {
    font-size: 14px;
  }
}

/* 中等屏幕优化 */
@media (max-width: 640px) {
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .btn-primary,
  .btn-success,
  .btn-warning {
    font-size: 12px;
    padding: 8px 2px;
  }
  
  .btn-primary {
    grid-column: 1 / 3;
  }
  
  .btn-success {
    grid-column: 1 / 2;
  }
  
  .btn-warning {
    grid-column: 2 / 3;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .page-container {
    padding: 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .btn-primary,
  .btn-success,
  .btn-warning {
    grid-column: 1 / 2;
    width: 100%;
    font-size: 14px;
    padding: 10px 8px;
  }
  
  .el-table {
    font-size: 13px;
  }
  
  .el-table :deep(.el-table__cell) {
    padding: 6px 8px;
  }
}

/* 极小屏幕优化 */
@media (max-width: 360px) {
  .page-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .btn-primary,
  .btn-success,
  .btn-warning {
    font-size: 12px;
    padding: 8px 4px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table :deep(.el-table__cell) {
    padding: 4px 6px;
  }
}

/* 对话框移动端优化 */
.topic-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.topic-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e4e7ed;
}

.topic-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.topic-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.topic-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}

.topic-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.topic-dialog :deep(.el-input),
.topic-dialog :deep(.el-textarea) {
  font-size: 14px;
}

.topic-dialog .dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.topic-dialog .btn-cancel,
.topic-dialog .btn-submit {
  min-width: 80px;
}

/* 移动端对话框优化 */
@media (max-width: 768px) {
  .topic-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% auto !important;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .topic-dialog :deep(.el-dialog__header) {
    padding: 16px 16px 8px;
  }
  
  .topic-dialog :deep(.el-dialog__title) {
    font-size: 16px;
  }
  
  .topic-dialog :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  .topic-dialog :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .topic-dialog :deep(.el-form-item__label) {
    font-size: 14px;
    padding-right: 8px;
  }
  
  .topic-dialog :deep(.el-input),
  .topic-dialog :deep(.el-textarea) {
    font-size: 14px;
  }
  
  .topic-dialog .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .topic-dialog .btn-cancel,
  .topic-dialog .btn-submit {
    width: 100%;
    margin: 0 !important;
  }
}

/* 批量操作对话框移动端优化 */
@media (max-width: 768px) {
  /* 批量新增和批量编辑对话框 */
  .el-dialog[aria-label="批量新增课题"],
  .el-dialog[aria-label="批量编辑课题"] {
    width: 95% !important;
    margin: 2% auto !important;
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-dialog__body),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-form-item),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-form-item__label),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-form-item__label) {
    font-size: 14px;
    padding-right: 8px;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-input),
  .el-dialog[aria-label="批量新增课题"] :deep(.el-textarea),
  .el-dialog[aria-label="批量新增课题"] :deep(.el-select),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-input),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-textarea),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-select) {
    font-size: 14px;
  }
  
  /* 批量操作按钮优化 */
  .el-dialog[aria-label="批量新增课题"] :deep(.el-button + .el-button),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-button + .el-button) {
    margin-left: 0 !important;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-dialog__footer),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-dialog__footer) {
    padding: 16px;
  }
  
  .el-dialog[aria-label="批量新增课题"] :deep(.el-dialog__footer .el-button),
  .el-dialog[aria-label="批量编辑课题"] :deep(.el-dialog__footer .el-button) {
    width: 100%;
    margin: 4px 0 !important;
  }
}

/* 课题详情对话框移动端优化 */
@media (max-width: 768px) {
  .el-dialog[aria-label="课题详情"] {
    width: 95% !important;
    margin: 2% auto !important;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-descriptions) {
    font-size: 14px;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-descriptions__label) {
    font-size: 14px;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-descriptions__content) {
    font-size: 14px;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-dialog__footer) {
    padding: 16px;
  }
  
  .el-dialog[aria-label="课题详情"] :deep(.el-dialog__footer .el-button) {
    width: 100%;
    margin: 4px 0 !important;
  }
}
</style>
