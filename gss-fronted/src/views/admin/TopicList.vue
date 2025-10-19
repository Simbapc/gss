// views/admin/TopicList.vue
<template>
  <div>
    <!-- 操作按钮 -->
    <div style="margin-bottom: 20px;">
      <el-button type="success" @click="handleBatchCreate" style="margin-left: 10px;">批量新增课题</el-button>
      <el-button type="warning" @click="handleBatchEdit" style="margin-left: 10px;">批量编辑课题</el-button>
    </div>

    <!-- 搜索和分页 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center;">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索课题标题或描述"
                style="width: 300px; margin-right: 10px;"
                @keyup.enter="handleSearch"
                clearable
                @clear="handleSearch"
            />
            <el-input
                v-model="teacherKeyword"
                placeholder="搜索指导教师"
                style="width: 200px; margin-right: 10px;"
                @keyup.enter="handleSearch"
                clearable
                @clear="handleSearch"
            />
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

    <el-table :data="topics" border v-loading="loading">
      <el-table-column prop="title" label="课题标题" />
      <el-table-column prop="teacher.name" label="指导教师" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'open' ? 'success' : 'info'">
            {{ scope.row.status === 'open' ? '开放中' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-popconfirm title="确定要删除此课题吗?" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
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

    <!-- 批量新增课题对话框 -->
    <el-dialog v-model="batchCreateDialogVisible" title="批量新增课题" width="80%">
      <div style="margin-bottom: 15px;">
        <el-button type="primary" @click="addBatchTopic" size="small">添加课题</el-button>
        <span style="margin-left: 10px; color: #666;">当前共 {{ batchTopics.length }} 个课题</span>
      </div>

      <el-form-item label="选择教师" style="margin-bottom: 20px;">
        <el-select v-model="selectedTeacherId" placeholder="请选择教师" style="width: 300px;">
          <el-option
            v-for="teacher in teachers"
            :key="teacher.id"
            :label="teacher.name"
            :value="teacher.id"
          />
        </el-select>
      </el-form-item>
      
      <div v-for="(topic, index) in batchTopics" :key="index" style="margin-bottom: 20px; padding: 15px; border: 1px solid #e4e7ed; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0;">课题 {{ index + 1 }}</h4>
          <el-button @click="removeBatchTopic(index)" type="danger" size="small" v-if="batchTopics.length > 1">删除</el-button>
        </div>
        <el-form :model="topic" label-width="80px">
          <el-form-item label="课题标题">
            <el-input v-model="topic.title" placeholder="请输入课题标题" />
          </el-form-item>
          <el-form-item label="课题描述">
            <el-input v-model="topic.description" type="textarea" :rows="3" placeholder="请输入课题描述" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="topic.status">
              <el-option label="开放中" value="open" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="batchCreateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCreateSubmit">批量创建</el-button>
      </template>
    </el-dialog>

    <!-- 批量编辑课题对话框 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑课题" width="80%">
      <div style="margin-bottom: 15px;">
        <span style="color: #666;">当前共 {{ batchTopics.length }} 个课题</span>
      </div>
      
      <div v-for="(topic, index) in batchTopics" :key="topic.id" style="margin-bottom: 20px; padding: 15px; border: 1px solid #e4e7ed; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0;">课题 {{ index + 1 }} (ID: {{ topic.id }}) - 教师: {{ topic.teacher?.name }}</h4>
        <el-form :model="topic" label-width="80px">
          <el-form-item label="课题标题">
            <el-input v-model="topic.title" placeholder="请输入课题标题" />
          </el-form-item>
          <el-form-item label="课题描述">
            <el-input v-model="topic.description" type="textarea" :rows="3" placeholder="请输入课题描述" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="topic.status">
              <el-option label="开放中" value="open" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchEditSubmit">批量更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  fetchAllTopics, 
  adminBatchCreateTopics, 
  adminBatchUpdateTopics, 
  adminDeleteTopic,
  fetchAllUsers 
} from '../../api/modules/admin';
import { ElMessage } from 'element-plus';

const topics = ref([]);
const teachers = ref([]);
const loading = ref(true);
const batchCreateDialogVisible = ref(false);
const batchEditDialogVisible = ref(false);
const batchTopics = ref([]);
const selectedTeacherId = ref('');

// 搜索和分页相关变量
const searchKeyword = ref('');
const teacherKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref('10');
const total = ref(0);

const loadTopics = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value,
      teacher: teacherKeyword.value
    };
    const res = await fetchAllTopics(params);
    topics.value = res.data.topics;
    total.value = res.data.pagination.total;
  } catch (error) {
    console.error("加载课题失败:", error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  loadTopics();
};

// 分页大小改变处理
const handlePageSizeChange = () => {
  currentPage.value = 1;
  loadTopics();
};

// 页码改变处理
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadTopics();
};

const loadTeachers = async () => {
  try {
    const res = await fetchAllUsers();
    // 注意：fetchAllUsers 现在返回分页结构，数据在 res.data.users 中
    teachers.value = res.data.users.filter(user => user.role === 'teacher');
  } catch (error) {
    console.error("加载教师列表失败:", error);
  }
};

onMounted(async () => {
  await loadTopics();
  await loadTeachers();
});

// 批量新增课题
const handleBatchCreate = () => {
  if (teachers.value.length === 0) {
    ElMessage.warning('暂无教师数据，无法批量创建课题');
    return;
  }
  batchTopics.value = [
    { title: '', description: '', status: 'open' },
    { title: '', description: '', status: 'open' },
    { title: '', description: '', status: 'open' }
  ];
  selectedTeacherId.value = teachers.value[0]?.id || '';
  batchCreateDialogVisible.value = true;
};

// 批量编辑课题
const handleBatchEdit = () => {
  batchTopics.value = topics.value.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    status: topic.status,
    teacher: topic.teacher
  }));
  batchEditDialogVisible.value = true;
};

// 添加新的课题行
const addBatchTopic = () => {
  batchTopics.value.push({ title: '', description: '', status: 'open' });
};

// 移除课题行
const removeBatchTopic = (index) => {
  batchTopics.value.splice(index, 1);
};

// 提交批量新增
const handleBatchCreateSubmit = async () => {
  try {
    if (!selectedTeacherId.value) {
      ElMessage.warning('请选择教师');
      return;
    }

    // 过滤掉空标题的课题
    const validTopics = batchTopics.value.filter(topic => topic.title.trim());
    
    if (validTopics.length === 0) {
      ElMessage.warning('请至少填写一个有效的课题标题');
      return;
    }

    const response = await adminBatchCreateTopics({
      topics: validTopics,
      teacherId: selectedTeacherId.value
    });
    ElMessage.success(response.data.message);
    batchCreateDialogVisible.value = false;
    await loadTopics();
  } catch (error) {
    console.error("批量新增失败:", error);
    ElMessage.error(error.response?.data?.message || '批量新增失败');
  }
};

// 提交批量编辑
const handleBatchEditSubmit = async () => {
  try {
    const response = await adminBatchUpdateTopics(batchTopics.value);
    ElMessage.success(response.data.message);
    
    // 显示详细的处理结果
    if (response.data.results.failed > 0) {
      ElMessage.warning(`部分课题更新失败: ${response.data.results.errors.join('; ')}`);
    }
    
    batchEditDialogVisible.value = false;
    await loadTopics();
  } catch (error) {
    console.error("批量编辑失败:", error);
    ElMessage.error(error.response?.data?.message || '批量编辑失败');
  }
};

// 删除课题
const handleDelete = async (topicId) => {
  try {
    await adminDeleteTopic(topicId);
    ElMessage.success('删除成功');
    await loadTopics();
  } catch (error) {
    console.error("删除失败:", error);
    const message = error.response?.data?.message || '删除失败，可能已有学生选择该课题';
    ElMessage.error(message);
  }
};
</script>
