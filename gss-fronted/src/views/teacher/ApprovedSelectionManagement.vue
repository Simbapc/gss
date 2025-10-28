<template>
  <div>
    <el-table v-if="!loading && selections.length > 0" :data="selections" style="width: 100%" border>
      <el-table-column prop="topic.title" label="课题标题" show-overflow-tooltip />
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
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 当加载完成但没有数据时，显示“空状态”提示 -->
    <el-empty v-if="!loading && selections.length === 0" description="暂无已通过的选题申请"></el-empty>

    <!-- 在加载过程中，显示加载动画 -->
    <div v-if="loading" v-loading="loading" style="width: 100%; height: 200px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchApprovedSelections } from '../../api/modules/selection';
import { ElMessage } from 'element-plus';

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