<template>
    <div>
        <!-- 
      【修复关键】: 使用 v-if 指令
      只在 "加载完成" (loading为false) 且 "有数据" (selections.length > 0) 时才渲染表格。
      这可以有效避免在数据加载过程中因渲染时机问题而产生的插槽警告。
    -->
        <el-table v-if="!loading && selections.length > 0" :data="selections" style="width: 100%" border>
            <el-table-column prop="topic.title" label="课题标题" show-overflow-tooltip />
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
            <el-table-column label="操作" width="180" align="center">
                <template #default="scope">
                    <el-button size="small" type="success" @click="handleReview(scope.row.id, 'approve')">通过</el-button>
                    <el-button size="small" type="danger" @click="handleReview(scope.row.id, 'reject')">拒绝</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 当加载完成但没有数据时，显示“空状态”提示 -->
        <el-empty v-if="!loading && selections.length === 0" description="暂无待审核的选题申请"></el-empty>

        <!-- 在加载过程中，显示一个全屏的加载动画 -->
        <div v-if="loading" v-loading="loading" style="width: 100%; height: 200px;"></div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchPendingSelections, reviewSelection } from '../../api/modules/selection';
import { ElMessage, ElMessageBox } from 'element-plus';

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
