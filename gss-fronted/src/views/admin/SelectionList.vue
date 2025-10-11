// src/views/admin/SelectionList.vue
<template>
    <el-table :data="selections" border v-loading="loading" style="width: 100%">
        <el-table-column prop="topic.title" label="课题标题" show-overflow-tooltip />
        <el-table-column prop="student.name" label="选择学生" width="150" />
        <el-table-column prop="student.username" label="学生学号" width="150" />
        <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)" effect="dark">
                    {{ statusText(scope.row.status) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新时间" width="200">
            <template #default="scope">
                {{ new Date(scope.row.updatedAt).toLocaleString() }}
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAllSelections } from '../../api/modules/admin';

const selections = ref([]);
const loading = ref(true);

const statusMap = {
    pending: { text: '待审核', type: 'warning' },
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
};
const statusText = (status) => statusMap[status]?.text || '未知';
const statusTagType = (status) => statusMap[status]?.type || 'info';

onMounted(async () => {
    try {
        const res = await fetchAllSelections();
        selections.value = res.data;
    } catch (error) {
        console.error("加载所有选题记录失败:", error);
    } finally {
        loading.value = false;
    }
});
</script>