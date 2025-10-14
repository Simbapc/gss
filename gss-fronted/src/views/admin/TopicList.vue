// views/admin/TopicList.vue
<template>
    <el-table :data="topics" border>
        <el-table-column prop="title" label="课题标题" />
        <el-table-column prop="teacher.name" label="指导教师" width="120" />
        <el-table-column prop="status" label="状态" width="100">
            <template #default="scope"><el-tag :type="scope.row.status === 'open' ? 'success' : 'info'">{{
                    scope.row.status }}</el-tag></template>
        </el-table-column>
    </el-table>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { fetchAllTopics } from '../../api/modules/admin';
const topics = ref([]);
const loading = ref(true);
onMounted(async () => {
    try {
        const res = await fetchAllTopics();
        topics.value = res.data;
    } finally {
        loading.value = false;
    }
});
</script>