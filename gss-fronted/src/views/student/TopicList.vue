<template>
    <div>
        <!-- 
      【阶段五 优化】: 添加 :row-class-name 属性来动态添加 CSS 类
    -->
        <el-table :data="topics" style="width: 100%" border v-loading="loading" :row-class-name="tableRowClassName">
            <el-table-column prop="title" label="课题标题" show-overflow-tooltip />
            <el-table-column prop="description" label="课题描述" show-overflow-tooltip />
            <el-table-column prop="teacher.name" label="指导教师" width="120" />
            <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                    <!-- 
            【阶段五 优化】: 
            如果当前行是已选择的课题，显示一个成功的标签。
            否则，显示一个“选择”按钮，该按钮在用户已有选择时会被禁用。
          -->
                    <div v-if="mySelection && scope.row.id === mySelection.topicId">
                        <el-tag type="success" effect="dark">
                            {{ mySelection.status === 'approved' ? '已通过' : '审核中' }}
                        </el-tag>
                    </div>
                    <div v-else>
                        <el-button size="small" type="primary" @click="handleSelect(scope.row.id)"
                            :disabled="!!mySelection">
                            选择
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAllOpenTopics, selectTopic } from '../../api/modules/topic';
import { getMySelection } from '../../api/modules/selection'; // 【阶段五 优化】: 引入获取个人选择的API
import { ElMessage, ElMessageBox } from 'element-plus';

const topics = ref([]);
const loading = ref(true);

// --- 【阶段五 优化】: 新增状态，用于存储学生自己的选择 ---
const mySelection = ref(null);

// 加载所有开放课题
const loadTopics = async () => {
    try {
        const res = await fetchAllOpenTopics();
        topics.value = res.data;
    } catch (error) {
        console.error("加载课题列表失败:", error);
        ElMessage.error('课题列表加载失败');
    }
};

// --- 【阶段五 优化】: 新增函数，加载学生自己的选择 ---
const loadMySelection = async () => {
    try {
        const res = await getMySelection();
        // 只有在选题状态是 pending 或 approved 时才算作有效选择
        if (res.data && (res.data.status === 'pending' || res.data.status === 'approved')) {
            mySelection.value = res.data;
        }
    } catch (error) {
        // 如果API返回404，说明学生没有选择，这不是一个真正的错误，所以静默处理
        if (error.response && error.response.status === 404) {
            mySelection.value = null;
        } else {
            console.error("加载个人选题信息失败:", error);
            ElMessage.error('个人选题信息加载失败');
        }
    }
};

// 在组件挂载时，并行加载课题列表和个人选择
onMounted(async () => {
    loading.value = true;
    // 使用 Promise.all 来并行执行两个异步请求，提升加载速度
    await Promise.all([loadTopics(), loadMySelection()]);
    loading.value = false;
});

// --- 【阶段五 优化】: 新增函数，用于给已选择的行添加高亮样式 ---
const tableRowClassName = ({ row }) => {
    if (mySelection.value && row.id === mySelection.value.topicId) {
        return 'selected-row';
    }
    return '';
};

// 处理选择课题的逻辑保持不变
const handleSelect = (topicId) => {
    ElMessageBox.confirm('确定要选择这个课题吗？提交后在教师审核前无法更改。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await selectTopic(topicId);
            ElMessage.success('选择成功，请等待教师审核');
            // 选择成功后，立即重新加载个人选择以更新UI
            loading.value = true;
            await loadMySelection();
            loading.value = false;
        } catch (error) {
            console.error("选择课题失败:", error);
            ElMessage.error(error.response?.data?.message || '选择失败');
        }
    }).catch(() => {
        ElMessage.info('已取消选择');
    });
};
</script>

<style scoped>
/* 
  【阶段五 优化】: 定义高亮行的样式 
  使用 :deep() 来穿透 scoped 限制，应用样式到 Element Plus 的子组件上
*/
.el-table :deep(tr.selected-row) {
    background-color: #f0f9eb;
    /* Element Plus success-light-9 color */
}
</style>