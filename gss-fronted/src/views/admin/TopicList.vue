<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 页面头部 -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div class="flex justify-between items-center py-3 sm:py-4">
                    <div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">课题管理</h1>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">管理系统课题信息和状态</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- 统计信息 -->
                        <div class="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                            <span>共 {{ total }} 个课题</span>
                            <span class="text-gray-300">|</span>
                            <span>当前页: {{ topics.length }} 个</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
            <!-- 操作工具栏 -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <!-- 左侧操作按钮 -->
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <button 
                            @click="handleBatchCreate" 
                            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            批量新增课题
                        </button>
                        <button 
                            @click="handleBatchEdit" 
                            class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            批量编辑课题
                        </button>
                    </div>

                    <!-- 右侧搜索和分页控制 -->
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <!-- 课题搜索 -->
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                v-model="searchKeyword"
                                placeholder="搜索课题标题或描述..."
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                                @keyup.enter="handleSearch"
                                @input="handleSearchInput"
                            />
                        </div>
                        
                        <!-- 教师搜索 -->
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                v-model="teacherKeyword"
                                placeholder="搜索指导教师..."
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
                                @keyup.enter="handleSearch"
                                @input="handleSearchInput"
                            />
                        </div>
                        
                        <button @click="handleSearch" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
                            搜索
                        </button>

                        <!-- 分页大小 -->
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600 whitespace-nowrap">每页:</span>
                            <select 
                                v-model="pageSize" 
                                @change="handlePageSizeChange" 
                                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 课题列表 -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <!-- 加载状态 -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="flex flex-col items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p class="mt-3 text-sm text-gray-500">加载中...</p>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else-if="topics.length === 0" class="flex justify-center items-center py-12">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无课题</h3>
                        <p class="mt-1 text-sm text-gray-500">当前筛选条件下没有找到课题</p>
                    </div>
                </div>

                <!-- 课题表格 -->
                <div v-else>
                    <!-- 移动端卡片布局 -->
                    <div class="lg:hidden space-y-4 p-4">
                        <div 
                            v-for="topic in topics" 
                            :key="topic.id"
                            class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div class="space-y-3">
                                <!-- 课题信息 -->
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900">{{ topic.title }}</h3>
                                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ topic.description || '暂无描述' }}</p>
                                </div>
                                
                                <!-- 教师信息 -->
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-600">指导教师: {{ topic.teacher?.name || '未知教师' }}</span>
                                    <span :class="[
                                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                        topic.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    ]">
                                        {{ topic.status === 'open' ? '开放中' : '已关闭' }}
                                    </span>
                                </div>
                                
                                <!-- 操作按钮 -->
                                <div class="flex justify-end">
                                    <button 
                                        @click="confirmDelete(topic.id)"
                                        class="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200 text-xs"
                                    >
                                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 桌面端表格布局 -->
                    <div class="hidden lg:block">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课题标题</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指导教师</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr 
                                    v-for="topic in topics" 
                                    :key="topic.id" 
                                    class="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td class="px-6 py-4">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">{{ topic.title }}</div>
                                            <div class="text-sm text-gray-500 mt-1">{{ topic.description || '暂无描述' }}</div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{{ topic.teacher?.name || '未知教师' }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <span :class="[
                                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                                            topic.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        ]">
                                            {{ topic.status === 'open' ? '开放中' : '已关闭' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <button 
                                            @click="confirmDelete(topic.id)"
                                            class="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200"
                                        >
                                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
                        class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                        上一页
                    </button>
                    <span class="px-3 py-2 text-sm text-gray-700">
                        第 {{ currentPage }} 页
                    </span>
                    <button 
                        @click="handlePageChange(currentPage + 1)" 
                        :disabled="currentPage * parseInt(pageSize) >= total"
                        class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>

        <!-- 批量新增课题对话框 -->
        <el-dialog v-model="batchCreateDialogVisible" title="批量新增课题" class="w-full sm:max-w-4xl lg:max-w-5xl mx-auto">
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <el-button type="primary" @click="addBatchTopic" size="small" class="w-full sm:w-auto">
                        添加课题
                    </el-button>
                    <span class="text-sm text-gray-600">当前共 {{ batchTopics.length }} 个课题</span>
                </div>

                <el-form-item label="选择教师" class="mb-4">
                    <el-select v-model="selectedTeacherId" placeholder="请选择教师" class="w-full">
                        <el-option
                            v-for="teacher in teachers"
                            :key="teacher.id"
                            :label="teacher.name"
                            :value="teacher.id"
                        />
                    </el-select>
                </el-form-item>
                
                <div v-for="(topic, index) in batchTopics" :key="index" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-center mb-3">
                        <h4 class="text-sm font-medium text-gray-900 m-0">课题 {{ index + 1 }}</h4>
                        <el-button 
                            @click="removeBatchTopic(index)" 
                            type="danger" 
                            size="small" 
                            v-if="batchTopics.length > 1"
                        >
                            删除
                        </el-button>
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
            <template #footer>
                <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <el-button @click="batchCreateDialogVisible = false" class="w-full sm:w-auto">取消</el-button>
                    <el-button type="primary" @click="handleBatchCreateSubmit" class="w-full sm:w-auto">批量创建</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 批量编辑课题对话框 -->
        <el-dialog v-model="batchEditDialogVisible" title="批量编辑课题" class="w-full sm:max-w-4xl lg:max-w-5xl mx-auto">
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
                                    class="w-full"
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
                        <el-button @click="batchEditDialogVisible = false" class="w-full sm:w-auto">取消</el-button>
                        <el-button type="primary" @click="handleBatchEditSubmit" :disabled="batchTopics.length === 0" class="w-full sm:w-auto">
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
