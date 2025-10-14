<template>
    <el-card v-if="mySelection && !loading" class="box-card">
        <template #header>
            <div class="card-header">
                <span>我的选题详情</span>
            </div>
        </template>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="选题状态">
                <el-tag :type="statusTagType(mySelection.status)">
                    {{ statusText(mySelection.status) }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="课题名称">{{ mySelection.topic.title }}</el-descriptions-item>
            <el-descriptions-item label="课题描述">{{ mySelection.topic.description }}</el-descriptions-item>
            <el-descriptions-item label="指导教师">{{ mySelection.topic.teacher.name }}</el-descriptions-item>
        </el-descriptions>
        <div style="text-align: center; margin-top: 20px;">
            <!-- “待审核”状态下，显示撤销按钮 -->
            <el-popconfirm v-if="mySelection.status === 'pending'" title="确定要撤销当前选择吗？" @confirm="handleCancel">
                <template #reference>
                    <el-button type="danger">撤销选题</el-button>
                </template>
            </el-popconfirm>

            <!-- “已拒绝”状态下，显示提示和“重新选择”按钮 -->
            <div v-if="mySelection.status === 'rejected'">
                <el-alert title="您的选题申请未通过" type="error" show-icon :closable="false"
                    style="margin-bottom: 15px;"></el-alert>
                <el-button type="primary" @click="handleCancel">我知道了，重新选择</el-button>
            </div>

            <!-- “已通过”状态下，显示成功提示 -->
            <el-alert v-if="mySelection.status === 'approved'" title="恭喜！选题成功。" type="success" show-icon
                :closable="false"></el-alert>
        </div>
    </el-card>

    <el-empty v-if="!mySelection && !loading" description="您当前还未选择任何课题"></el-empty>

    <div v-if="loading" v-loading="loading" style="height: 200px;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMySelection, cancelSelection } from '../../api/modules/selection';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const mySelection = ref(null);
const loading = ref(true);
const router = useRouter();

const statusMap = {
    pending: { text: '待审核', type: 'warning' },
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'error' }, // type 改为 error
};
const statusText = (status) => statusMap[status]?.text || '未知';
const statusTagType = (status) => statusMap[status]?.type || 'info';

const fetchMySelection = async () => {
    loading.value = true;
    try {
        const res = await getMySelection();
        // 在getMySelection的后端实现中，我们让未选择时返回null，所以这里res.data可能为null
        mySelection.value = res.data;
    } catch (error) {
        console.error("获取我的选题失败:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchMySelection);

// 该函数现在用于“撤销”和“清除已拒绝状态”
const handleCancel = async () => {
    try {
        await cancelSelection();
        ElMessage.success('操作成功，现在可以重新选择课题。');
        // 跳转回课题列表页，让学生可以重新选择
        router.push({ name: 'StudentTopicList' });
    } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error(error.response?.data?.message || '操作失败');
    }
};
</script>

<style scoped>
.card-header {
    font-size: 18px;
    font-weight: bold;
}
</style>