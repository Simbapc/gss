<template>
  <div>
    <!-- 操作按钮 -->
    <el-button type="primary" @click="handleCreate" style="margin-bottom: 20px;">新增课题</el-button>

    <!-- 课题列表表格 -->
    <!-- 【阶段五 优化】: 将 @row-click 从 handleEdit 改为 handleRowClick -->
    <el-table :data="topics" style="width: 100%" border v-loading="loading" @row-click="handleRowClick">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="课题标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="课题描述">
          <el-input v-model="form.description" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchMyTopics, createTopic, updateTopic, deleteTopic } from '../../api/modules/topic';
import { ElMessage } from 'element-plus';

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
</script>

<style scoped>
.el-table :deep(.el-table__row) {
  cursor: pointer;
}

/* 解决描述内容过长时不换行的问题 */
.el-descriptions__content {
  white-space: pre-wrap;
}
</style>