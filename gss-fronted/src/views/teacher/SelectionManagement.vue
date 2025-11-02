<template>
    <div class="page-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2 class="page-title">选题申请审核</h2>
            <div class="page-subtitle">管理学生提交的选题申请</div>
        </div>

        <!-- 数据表格 -->
        <el-table v-if="!loading && selections.length > 0" :data="selections" class="data-table">
            <el-table-column prop="topic.title" label="课题标题" show-overflow-tooltip min-width="200" />
            <el-table-column prop="student.name" label="申请学生" width="120" />
            <el-table-column prop="student.username" label="学生学号" width="120" />
            <el-table-column prop="student.major" label="专业" width="150" align="center">
                <template #default="scope">
                    <el-tag v-if="scope.row.student.major" type="info" effect="plain">
                        {{ scope.row.student.major }}
                    </el-tag>
                    <span v-else style="color: #999;">-</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <div class="action-buttons">
                        <el-button size="small" type="success" @click="handleReview(scope.row.id, 'approve')" class="btn-approve">
                            <el-icon><Check /></el-icon>
                            通过
                        </el-button>
                        <el-button size="small" type="danger" @click="handleReview(scope.row.id, 'reject')" class="btn-reject">
                            <el-icon><Close /></el-icon>
                            拒绝
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 当加载完成但没有数据时，显示"空状态"提示 -->
        <el-empty v-if="!loading && selections.length === 0" description="暂无待审核的选题申请" class="empty-state">
            <el-button type="primary" @click="loadData">刷新</el-button>
        </el-empty>

        <!-- 在加载过程中，显示加载动画 -->
        <div v-if="loading" v-loading="loading" class="loading-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchPendingSelections, reviewSelection } from '../../api/modules/selection';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue';

const selections = ref([]);
const loading = ref(true);

const loadData = async () => {
    // 确保每次加载前都将 loading 设为 true
    loading.value = true;
    try {
        const res = await fetchPendingSelections();
        selections.value = res.data;
    } catch (error) {
        console.error("加载待审核列表失败:", error);
        ElMessage.error("数据加载失败，请稍后重试。");
    } finally {
        loading.value = false;
    }
};

onMounted(loadData);

const handleReview = async (selectionId, decision) => {
    const actionText = decision === 'approve' ? '通过' : '拒绝';
    const confirmMessage = decision === 'approve'
        ? '确定要通过该学生的申请吗？此操作将会关闭该课题，并自动拒绝其他学生。'
        : '确定要拒绝该学生的申请吗？';

    ElMessageBox.confirm(confirmMessage, '审核确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await reviewSelection(selectionId, decision);
            ElMessage.success(`操作成功，已${actionText}该申请。`);
            // 操作成功后，重新加载数据以刷新列表
            await loadData();
        } catch (error) {
            console.error("审核操作失败:", error);
            ElMessage.error("操作失败，请稍后重试。");
        }
    }).catch(() => {
        ElMessage.info('已取消操作');
    });
};
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

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-approve,
.btn-reject {
  display: flex;
  align-items: center;
  gap: 4px;
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
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .btn-approve,
  .btn-reject {
    width: 100%;
    justify-content: center;
  }
}
</style>
