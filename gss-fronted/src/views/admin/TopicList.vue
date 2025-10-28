// views/admin/TopicList.vue
<template>
  <div class="p-4 sm:p-6">
    <!-- 操作按钮 -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
      <button @click="handleBatchCreate" class="btn-secondary w-full sm:w-auto">批量新增课题</button>
      <button @click="handleBatchEdit" class="btn-warning w-full sm:w-auto">批量编辑课题</button>
    </div>

    <!-- 搜索和分页 -->
    <div class="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div class="relative w-full sm:w-64">
                <input
                    v-model="searchKeyword"
                    placeholder="搜索课题标题或描述"
                    class="form-input pr-10"
                    @keyup.enter="handleSearch"
                    @input="handleSearchInput"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
            <div class="relative w-full sm:w-48">
                <input
                    v-model="teacherKeyword"
                    placeholder="搜索指导教师"
                    class="form-input pr-10"
                    @keyup.enter="handleSearch"
                    @input="handleSearchInput"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
            <button @click="handleSearch" class="btn-primary w-full sm:w-auto">搜索</button>
        </div>
        
        <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600 whitespace-nowrap">每页显示:</span>
            <select v-model="pageSize" @change="handlePageSizeChange" class="form-input w-24">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>
    </div>

    <!-- 课题列表 -->
    <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <div v-else>
        <!-- 移动端卡片布局 -->
        <div class="space-y-4 lg:hidden">
            <div v-for="topic in topics" :key="topic.id" class="card">
                <div class="p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="font-medium text-gray-900 text-sm leading-tight">{{ topic.title }}</h3>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ topic.description || '暂无描述' }}</p>
                        </div>
                        <span :class="[
                            'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2',
                            topic.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        ]">
                            {{ topic.status === 'open' ? '开放中' : '已关闭' }}
                        </span>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span class="flex items-center">
                            <svg class="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {{ topic.teacher?.name || '未知教师' }}
                        </span>
                        <span>ID: {{ topic.id }}</span>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button @click="confirmDelete(topic.id)" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 桌面端表格布局 -->
        <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课题标题</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指导教师</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="topic in topics" :key="topic.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <div>
                                <div class="text-sm font-medium text-gray-900">{{ topic.title }}</div>
                                <div class="text-sm text-gray-500 mt-1">{{ topic.description || '暂无描述' }}</div>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900">{{ topic.teacher?.name || '未知教师' }}</td>
                        <td class="px-4 py-3 text-sm text-center">
                            <span :class="[
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                topic.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            ]">
                                {{ topic.status === 'open' ? '开放中' : '已关闭' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-center">
                            <button @click="confirmDelete(topic.id)" class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200">
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- 分页组件 -->
    <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="text-sm text-gray-700">
            显示第 {{ (currentPage - 1) * parseInt(pageSize) + 1 }} 到 {{ Math.min(currentPage * parseInt(pageSize), total) }} 条，共 {{ total }} 条记录
        </div>
        <div class="flex items-center space-x-2">
            <button 
                @click="handlePageChange(currentPage - 1)" 
                :disabled="currentPage <= 1"
                class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                上一页
            </button>
            <span class="px-3 py-2 text-sm text-gray-700">
                第 {{ currentPage }} 页
            </span>
            <button 
                @click="handlePageChange(currentPage + 1)" 
                :disabled="currentPage * parseInt(pageSize) >= total"
                class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                下一页
            </button>
        </div>
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
      <div class="space-y-4">
        <!-- 教师筛选区域 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
            <div class="flex-1">
              <el-form-item label="筛选教师" class="mb-0">
                <el-select 
                  v-model="selectedEditTeacherId" 
                  placeholder="请选择教师" 
                  @change="handleTeacherFilterChange"
                  class="w-full sm:w-64"
                  clearable
                >
                  <el-option
                    v-for="teacher in teachers"
                    :key="teacher.id"
                    :label="teacher.name"
                    :value="teacher.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="text-sm text-gray-600">
              <span v-if="selectedEditTeacherId">
                当前显示: {{ getTeacherName(selectedEditTeacherId) }} 的课题 (共 {{ batchTopics.length }} 个)
              </span>
              <span v-else>
                请先选择教师以查看课题
              </span>
            </div>
          </div>
        </div>

        <!-- 课题编辑区域 -->
        <div v-if="batchTopics.length > 0" class="space-y-4 max-h-96 overflow-y-auto">
          <div v-for="(topic, index) in batchTopics" :key="topic.id" class="p-4 border border-gray-200 rounded-lg bg-white">
            <div class="flex justify-between items-start mb-3">
              <h4 class="text-sm font-medium text-gray-900 m-0">
                课题 {{ index + 1 }} (ID: {{ topic.id }}) - 教师: {{ topic.teacher?.name }}
              </h4>
              <el-tag :type="topic.status === 'open' ? 'success' : 'info'" size="small">
                {{ topic.status === 'open' ? '开放中' : '已关闭' }}
              </el-tag>
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
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <svg class="h-12 w-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="mt-2" v-if="selectedEditTeacherId">该教师暂无课题数据</p>
          <p class="mt-2" v-else>请先选择教师以查看课题</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div class="text-sm text-gray-600">
            共 {{ batchTopics.length }} 个课题待编辑
          </div>
          <div class="flex space-x-3">
            <el-button @click="batchEditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleBatchEditSubmit" :disabled="batchTopics.length === 0">
              批量更新
            </el-button>
          </div>
        </div>
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
const selectedEditTeacherId = ref('');
const allTopics = ref([]); // 保存所有课题用于筛选

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

// 搜索输入处理
const handleSearchInput = () => {
  // 防抖搜索，避免频繁请求
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

let searchTimeout = null;

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  loadTopics();
};

// 删除确认
const confirmDelete = (topicId) => {
  if (confirm('确定要删除此课题吗？')) {
    handleDelete(topicId);
  }
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
  allTopics.value = topics.value.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    status: topic.status,
    teacher: topic.teacher
  }));
  // 默认不显示任何课题，需要用户先选择教师
  batchTopics.value = [];
  selectedEditTeacherId.value = '';
  batchEditDialogVisible.value = true;
  
  console.log('批量编辑课题数据:', allTopics.value);
  console.log('教师列表:', teachers.value);
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

// 教师筛选处理
const handleTeacherFilterChange = () => {
  if (selectedEditTeacherId.value) {
    // 筛选指定教师的课题
    batchTopics.value = allTopics.value.filter(topic => {
      console.log('筛选检查:', {
        topicId: topic.id,
        topicTeacher: topic.teacher,
        selectedTeacherId: selectedEditTeacherId.value,
        match: topic.teacher?.id === selectedEditTeacherId.value
      });
      
      // 多种匹配方式
      const teacherId = selectedEditTeacherId.value;
      const teacher = teachers.value.find(t => t.id === teacherId);
      const teacherName = teacher?.name;
      
      // 1. 直接ID匹配
      if (topic.teacher?.id === teacherId) {
        return true;
      }
      
      // 2. 通过教师姓名匹配
      if (teacherName && topic.teacher?.name === teacherName) {
        return true;
      }
      
      // 3. 通过教师ID字符串匹配（处理可能的类型不一致）
      if (String(topic.teacher?.id) === String(teacherId)) {
        return true;
      }
      
      return false;
    });
  } else {
    // 显示所有课题
    batchTopics.value = [...allTopics.value];
  }
  console.log('筛选后课题数量:', batchTopics.value.length);
};

// 获取教师姓名
const getTeacherName = (teacherId) => {
  const teacher = teachers.value.find(t => t.id === teacherId);
  return teacher?.name || '未知教师';
};
</script>
