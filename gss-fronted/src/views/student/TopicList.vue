<template>
    <div>
        <el-alert v-if="mySelection"
            :title="`您已选择课题：【${mySelection.topic.title}】，当前状态：${statusText(mySelection.status)}。`" type="success"
            :closable="false" show-icon>
            请前往 <router-link to="/student/my-selection">我的选题</router-link> 页面查看详情。
        </el-alert>

        <el-table :data="topics" style="width: 100%; margin-top: 20px;" border v-loading="loading">
            <el-table-column prop="title" label="课题标题" />
            <el-table-column prop="description" label="课题描述" show-overflow-tooltip />
            <el-table-column prop="teacher.name" label="指导教师" width="120" />
            <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleSelect(scope.row.id)"
                        :disabled="!!mySelection">
                        选择
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchAvailableTopics } from '../../api/modules/topic';
import { selectTopic, getMySelection } from '../../api/modules/selection';
import { ElMessage, ElMessageBox } from 'element-plus';

const topics = ref([]);
const mySelection = ref(null);
const loading = ref(true);

const statusText = (status) => {
    const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' };
    return map[status] || '未知';
};

const fetchData = async () => {
    loading.value = true;
    try {
        const [topicsRes, selectionRes] = await Promise.all([
            fetchAvailableTopics(),
            getMySelection(),
        ]);
        topics.value = topicsRes.data;
        mySelection.value = selectionRes.data;
    } catch (error) {
        console.error("数据加载失败:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

const handleSelect = (topicId) => {
    ElMessageBox.confirm('确定要选择此课题吗？选择后在教师审核前可以撤销。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            loading.value = true;
            await selectTopic(topicId);
            ElMessage.success('选题成功！');
            await fetchData(); // 重新加载数据以更新页面状态
        } catch (error) {
            console.error("选择课题失败:", error);
        } finally {
            loading.value = false;
        }
    }).catch(() => {
        // 用户取消操作
    });
};
</script>
<style scoped>
.router-link {
    color: #409EFF;
    text-decoration: none;
}
</style>