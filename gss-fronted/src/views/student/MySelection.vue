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
            <el-popconfirm v-if="mySelection.status === 'pending'" title="确定要撤销当前选择吗？" @confirm="handleCancel">
                <template #reference>
                    <el-button type="danger">撤销选题</el-button>
                </template>
            </el-popconfirm>
            <el-alert v-if="mySelection.status === 'rejected'" title="您的选题申请未通过，请重新选择。" type="error" show-icon
                :closable="false"></el-alert>
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
    rejected: { text: '已拒绝', type: 'danger' },
};
const statusText = (status) => statusMap[status]?.text || '未知';
const statusTagType = (status) => statusMap[status]?.type || 'info';

const fetchMySelection = async () => {
    loading.value = true;
    try {
        const res = await getMySelection();
        mySelection.value = res.data;
    } catch (error) {
        console.error("获取我的选题失败:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchMySelection);

const handleCancel = async () => {
    try {
        await cancelSelection();
        ElMessage.success('选题已成功撤销！');
        // 跳转回课题列表页，让学生可以重新选择
        router.push({ name: 'StudentTopicList' });
    } catch (error) {
        console.error("撤销失败:", error);
    }
};
</script>

<style scoped>
.card-header {
    font-size: 18px;
    font-weight: bold;
}
</style>