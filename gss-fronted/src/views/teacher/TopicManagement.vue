<template>
  <div>
    <!-- 操作按钮 -->
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleCreate">新增课题</el-button>
      <el-button type="success" @click="handleBatchCreate" style="margin-left: 10px;">批量新增</el-button>
      <el-button type="warning" @click="handleBatchEdit" style="margin-left: 10px;">批量编辑</el-button>
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
import { ref, reactive, onMounted } from 'vue';
import { fetchMyTopics, createTopic, updateTopic, deleteTopic, batchCreateTopics, batchUpdateTopics } from '../../api/modules/topic';
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
    console.log(batchTopics.value);
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
.el-table :deep(.el-table__row) {
  cursor: pointer;
}

/* 解决描述内容过长时不换行的问题 */
.el-descriptions__content {
  white-space: pre-wrap;
}
</style>
