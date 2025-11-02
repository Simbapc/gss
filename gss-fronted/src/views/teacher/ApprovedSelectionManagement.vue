<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">已通过选题</h2>
      <div class="page-subtitle">查看已审核通过的选题申请</div>
    </div>

    <!-- 数据表格 -->
    <el-table v-if="!loading && selections.length > 0" :data="selections" class="data-table">
      <el-table-column prop="topic.title" label="课题标题" show-overflow-tooltip min-width="200" />
      <el-table-column prop="topic.description" label="课题描述" show-overflow-tooltip width="300" />
      <el-table-column prop="student.name" label="学生姓名" width="120" />
      <el-table-column prop="student.username" label="学生学号" width="120" />
      <el-table-column prop="student.major" label="专业" width="150" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.student.major" type="info" effect="plain">
            {{ scope.row.student.major }}
          </el-tag>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="updatedAt" label="通过时间" width="180">
        <template #default="scope">
          <div class="time-cell">
            <el-icon><Clock /></el-icon>
            {{ formatDate(scope.row.updatedAt) }}
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 当加载完成但没有数据时，显示"空状态"提示 -->
    <el-empty v-if="!loading && selections.length === 0" description="暂无已通过的选题申请" class="empty-state">
      <el-button type="primary" @click="loadData">刷新</el-button>
    </el-empty>

    <!-- 在加载过程中，显示加载动画 -->
    <div v-if="loading" v-loading="loading" class="loading-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchApprovedSelections } from '../../api/modules/selection';
import { ElMessage } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';

const selections = ref([]);
const loading = ref(true);

// 加载已通过的选题数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await fetchApprovedSelections();
    selections.value = res.data;
  } catch (error) {
    console.error("加载已通过选题列表失败:", error);
    ElMessage.error("数据加载失败，请稍后重试。");
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时加载数据
onMounted(loadData);
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.data-table :deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

.data-table :deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

.data-table :deep(.el-table__header) {
  background-color: #f8fafc;
}

.data-table :deep(.el-table__cell) {
  padding: 12px 16px;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.empty-state {
  margin: 40px 0;
}

.loading-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .data-table :deep(.el-table__cell) {
    padding: 8px 12px;
  }
  
  .time-cell {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }
}
</style>
