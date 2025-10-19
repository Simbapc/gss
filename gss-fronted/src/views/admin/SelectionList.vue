// src/views/admin/SelectionList.vue
<template>
    <!-- 搜索和分页 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索学生姓名或学号"
                style="width: 250px;"
                @keyup.enter="handleSearch"
                clearable
                @clear="handleSearch"
            />
            <el-input
                v-model="topicKeyword"
                placeholder="搜索课题标题"
                style="width: 250px;"
                @keyup.enter="handleSearch"
                clearable
                @clear="handleSearch"
            />
            <el-select
                v-model="statusFilter"
                placeholder="选择状态"
                style="width: 150px;"
                @change="handleSearch"
                clearable
            >
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        
        <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px; color: #666;">每页显示:</span>
            <el-select v-model="pageSize" @change="handlePageSizeChange" style="width: 100px;">
                <el-option label="10" value="10" />
                <el-option label="20" value="20" />
                <el-option label="50" value="50" />
            </el-select>
        </div>
    </div>

    <el-table :data="selections" border style="width: 100%" v-loading="loading">
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

    <!-- 分页组件 -->
    <div style="margin-top: 20px; display: flex; justify-content: center;">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handleCurrentChange"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAllSelections } from '../../api/modules/admin';

const selections = ref([]);
const loading = ref(true);

// 搜索和分页相关变量
const searchKeyword = ref('');
const topicKeyword = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref('10');
const total = ref(0);

const statusMap = {
    pending: { text: '待审核', type: 'warning' },
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
};
const statusText = (status) => statusMap[status]?.text || '未知';
const statusTagType = (status) => statusMap[status]?.type || 'info';

const loadSelections = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchKeyword.value,
            topic: topicKeyword.value,
            status: statusFilter.value
        };
        const res = await fetchAllSelections(params);
        selections.value = res.data.selections;
        total.value = res.data.pagination.total;
    } catch (error) {
        console.error("加载所有选题记录失败:", error);
    } finally {
        loading.value = false;
    }
};

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1;
    loadSelections();
};

// 分页大小改变处理
const handlePageSizeChange = () => {
    currentPage.value = 1;
    loadSelections();
};

// 页码改变处理
const handleCurrentChange = (page) => {
    currentPage.value = page;
    loadSelections();
};

onMounted(loadSelections);
</script>
