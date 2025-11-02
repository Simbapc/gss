<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div class="flex justify-between items-center py-3 sm:py-4">
          <div>
            <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">课题列表</h1>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">浏览和选择可用的毕业设计课题</p>
          </div>
          <div class="flex items-center space-x-3">
            <!-- 统计信息 -->
            <div class="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
              <span>共 {{ teacherSearch ? filteredTopics.length : topics.length }} 个课题</span>
              <span v-if="mySelection" class="text-gray-300">|</span>
              <span v-if="mySelection" :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                mySelection.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              ]">
                {{ mySelection.status === 'approved' ? '已通过' : '审核中' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
      <!-- 搜索工具栏 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <!-- 左侧统计信息 -->
          <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div class="text-sm text-gray-600">
              <span class="font-medium text-gray-900">{{ filteredTopics.length }}</span> 个可用课题
            </div>
            <div v-if="mySelection" class="text-sm text-gray-600">
              <span class="text-gray-300">|</span>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2',
                mySelection.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              ]">
                {{ mySelection.status === 'approved' ? '已通过' : '审核中' }}
              </span>
            </div>
          </div>

          <!-- 右侧搜索区域 -->
          <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <!-- 教师筛选下拉菜单 -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <select
                v-model="selectedTeacher"
                @change="handleTeacherFilter"
                class="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 appearance-none bg-white"
              >
                <option value="">所有教师</option>
                <option v-for="teacher in uniqueTeachers" :key="teacher" :value="teacher">{{ teacher }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- 教师搜索 -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="teacherSearch"
                placeholder="搜索指导教师..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                @input="handleSearch"
              />
            </div>
            
            <!-- 实用功能按钮组 -->
            <div class="flex items-center space-x-2">
              <!-- 收藏按钮 -->
              <button 
                @click="toggleShowFavorites"
                :class="[
                  'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  showFavorites 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                <svg class="w-4 h-4 mr-1" :class="showFavorites ? 'text-yellow-500' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                收藏
              </button>
              
              <!-- 刷新按钮 -->
              <button 
                @click="refreshTopics"
                class="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>
            </div>
            
            <!-- 清除筛选按钮 -->
            <button 
              v-if="selectedTeacher || teacherSearch"
              @click="clearAllFilters"
              class="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除筛选
            </button>
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无开放课题</h3>
            <p class="mt-1 text-sm text-gray-500">当前没有可选择的毕业设计课题</p>
          </div>
        </div>

        <!-- 课题表格 -->
        <div v-else>
          <!-- 搜索结果提示 -->
          <div v-if="teacherSearch" class="bg-blue-50 border-b border-blue-200 px-4 sm:px-6 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center text-sm text-blue-700">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索"{{ teacherSearch }}"的结果: 找到 {{ filteredTopics.length }} 个课题
              </div>
              <button 
                @click="clearSearch"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                清除搜索
              </button>
            </div>
          </div>

          <!-- 空搜索状态 -->
          <div v-if="teacherSearch && filteredTopics.length === 0" class="flex justify-center items-center py-12">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">未找到相关课题</h3>
              <p class="mt-1 text-sm text-gray-500">没有找到包含"{{ teacherSearch }}"的指导教师课题</p>
              <button 
                @click="clearSearch"
                class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                查看所有课题
              </button>
            </div>
          </div>

          <!-- 移动端卡片布局 -->
          <div v-if="!teacherSearch || filteredTopics.length > 0" class="lg:hidden space-y-4 p-4">
            <div 
              v-for="topic in paginatedTopics" 
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
                <div class="flex justify-between items-center">
                  <!-- 收藏按钮 -->
                  <button 
                    @click="toggleFavorite(topic.id)"
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-md text-xs transition-colors duration-200',
                      favoriteTopics.has(topic.id) 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-gray-500'
                    ]"
                  >
                    <svg class="w-4 h-4" :fill="favoriteTopics.has(topic.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  
                  <!-- 选择按钮 -->
                  <div v-if="mySelection && topic.id === mySelection.topicId">
                    <span :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      mySelection.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ mySelection.status === 'approved' ? '已通过' : '审核中' }}
                    </span>
                  </div>
                  <div v-else>
                    <button 
                      @click="handleSelect(topic.id)"
                      :disabled="!!mySelection"
                      :class="[
                        'inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200 text-xs',
                        mySelection ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                      ]"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      选择
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面端表格布局 -->
          <div v-if="!teacherSearch || filteredTopics.length > 0" class="hidden lg:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课题标题</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课题描述</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指导教师</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="topic in paginatedTopics" 
                  :key="topic.id" 
                  :class="[
                    'hover:bg-gray-50 transition-colors duration-150',
                    mySelection && topic.id === mySelection.topicId ? 'bg-green-50' : ''
                  ]"
                >
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ topic.title }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-500">{{ topic.description || '暂无描述' }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ topic.teacher?.name || '未知教师' }}</td>
                  <td class="px-6 py-4 text-sm text-center">
                    <div class="flex items-center justify-center space-x-2">
                      <!-- 收藏按钮 -->
                      <button 
                        @click="toggleFavorite(topic.id)"
                        :class="[
                          'inline-flex items-center p-1 rounded-md transition-colors duration-200',
                          favoriteTopics.has(topic.id) 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-gray-500'
                        ]"
                      >
                        <svg class="w-4 h-4" :fill="favoriteTopics.has(topic.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      
                      <!-- 选择按钮 -->
                      <div v-if="mySelection && topic.id === mySelection.topicId">
                        <span :class="[
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                          mySelection.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        ]">
                          {{ mySelection.status === 'approved' ? '已通过' : '审核中' }}
                        </span>
                      </div>
                      <div v-else>
                        <button 
                          @click="handleSelect(topic.id)"
                          :disabled="!!mySelection"
                          :class="[
                            'inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200',
                            mySelection 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          ]"
                        >
                          选择
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="filteredTopics.length > 0" class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="text-sm text-gray-700">
          显示第 {{ (currentPage - 1) * pageSize + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredTopics.length) }} 条，共 {{ filteredTopics.length }} 条记录
        </div>
        <div class="flex items-center space-x-2">
          <!-- 每页显示数量选择 -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 whitespace-nowrap">每页:</span>
            <select 
              v-model="pageSize" 
              @change="handlePageSizeChange(pageSize)" 
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <!-- 分页按钮 -->
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
            :disabled="currentPage * pageSize >= filteredTopics.length"
            class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchAllOpenTopics, selectTopic } from '../../api/modules/topic';
import { getMySelection } from '../../api/modules/selection'; // 【阶段五 优化】: 引入获取个人选择的API
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute } from 'vue-router';

const topics = ref([]);
const loading = ref(true);

// --- 【阶段五 优化】: 新增状态，用于存储学生自己的选择 ---
const mySelection = ref(null);

// 搜索相关状态
const teacherSearch = ref('');
const selectedTeacher = ref('');

// 实用功能状态
const showFavorites = ref(false);
const favoriteTopics = ref(new Set());

// 路由实例
const route = useRoute();

// 从本地存储加载收藏数据
const loadFavoritesFromStorage = () => {
  try {
    const stored = localStorage.getItem('student_favorite_topics');
    if (stored) {
      const favorites = JSON.parse(stored);
      favoriteTopics.value = new Set(favorites);
    }
  } catch (error) {
    console.error('加载收藏数据失败:', error);
  }
};

// 保存收藏数据到本地存储
const saveFavoritesToStorage = () => {
  try {
    const favorites = Array.from(favoriteTopics.value);
    localStorage.setItem('student_favorite_topics', JSON.stringify(favorites));
  } catch (error) {
    console.error('保存收藏数据失败:', error);
  }
};

// 计算属性：获取唯一的教师列表
const uniqueTeachers = computed(() => {
  const teachers = topics.value
    .map(topic => topic.teacher?.name)
    .filter(name => name && name.trim())
    .filter((name, index, array) => array.indexOf(name) === index)
    .sort();
  return teachers;
});

// 计算属性：过滤后的课题列表（包含收藏功能）
const filteredTopics = computed(() => {
  let filtered = topics.value;
  
  // 教师筛选
  if (selectedTeacher.value) {
    filtered = filtered.filter(topic => topic.teacher?.name === selectedTeacher.value);
  }
  
  // 搜索筛选
  if (teacherSearch.value.trim()) {
    const searchTerm = teacherSearch.value.toLowerCase().trim();
    filtered = filtered.filter(topic => {
      const teacherName = topic.teacher?.name || '';
      return teacherName.toLowerCase().includes(searchTerm);
    });
  }
  
  // 收藏筛选
  if (showFavorites.value) {
    filtered = filtered.filter(topic => favoriteTopics.value.has(topic.id));
  }
  
  return filtered;
});

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.ceil(filteredTopics.value.length / pageSize.value));

// 计算属性：分页后的课题列表
const paginatedTopics = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredTopics.value.slice(startIndex, endIndex);
});

// 搜索处理函数
const handleSearch = () => {
  // 防抖搜索，避免频繁触发
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // 搜索逻辑已经在计算属性中实现
  }, 300);
};

// 清除搜索
const clearSearch = () => {
  teacherSearch.value = '';
};

let searchTimeout = null;

// 教师筛选处理
const handleTeacherFilter = () => {
  currentPage.value = 1; // 重置到第一页
};

// 清除所有筛选
const clearAllFilters = () => {
  selectedTeacher.value = '';
  teacherSearch.value = '';
  currentPage.value = 1;
};

// 分页处理函数
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 加载所有开放课题
// 修改加载函数，添加错误重试逻辑
const loadTopics = async (retryCount = 0) => {
  try {
    const res = await fetchAllOpenTopics();
    topics.value = res.data;
  } catch (error) {
    console.error("加载课题列表失败:", error);
    // 添加重试逻辑
    if (retryCount < 2) {
      setTimeout(() => loadTopics(retryCount + 1), 1000);
    } else {
      ElMessage.error('课题列表加载失败，请刷新页面重试');
    }
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
    // 加载收藏数据
    loadFavoritesFromStorage();
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

// 实用功能实现
const toggleShowFavorites = () => {
  showFavorites.value = !showFavorites.value;
  currentPage.value = 1; // 重置到第一页
  
  if (showFavorites.value) {
    ElMessage.info('显示收藏的课题');
  } else {
    ElMessage.info('显示所有课题');
  }
};

// 刷新课题列表
const refreshTopics = async () => {
  loading.value = true;
  try {
    await Promise.all([loadTopics(), loadMySelection()]);
    ElMessage.success('课题列表已刷新');
  } catch (error) {
    console.error("刷新课题列表失败:", error);
    ElMessage.error('刷新失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 收藏课题
const toggleFavorite = (topicId) => {
  if (favoriteTopics.value.has(topicId)) {
    favoriteTopics.value.delete(topicId);
    ElMessage.info('已取消收藏');
  } else {
    favoriteTopics.value.add(topicId);
    ElMessage.success('已收藏课题');
  }
  // 保存收藏状态到本地存储
  saveFavoritesToStorage();
};

// 监听路由变化，当有刷新参数时自动刷新数据
watch(
  () => route.query.refresh,
  (newVal) => {
    if (newVal === 'true') {
      console.log('检测到刷新参数，开始刷新课题列表...');
      // 自动刷新数据
      refreshTopics();
      // 清除查询参数，避免重复刷新
      const currentQuery = { ...route.query };
      delete currentQuery.refresh;
      // 使用 replace 而不是 push 来避免浏览器历史记录增加
      window.history.replaceState({}, '', `${window.location.pathname}?${new URLSearchParams(currentQuery).toString()}`);
    }
  }
);

// 处理选择课题的逻辑
const handleSelect = (topicId) => {
  ElMessageBox.confirm('确定要选择这个课题吗？提交后在教师审核前无法更改。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      loading.value = true;
      await selectTopic(topicId);
      ElMessage.success('选择成功，请等待教师审核');
      
      // 选择成功后，立即重新加载个人选择和课题列表以更新UI
      await Promise.all([loadMySelection(), loadTopics()]);
    } catch (error) {
      console.error("选择课题失败:", error);
      
      // 根据不同的错误类型显示不同的提示
      const errorMessage = error.response?.data?.message || '选择失败';
      
      if (errorMessage.includes('已被其他学生选择')) {
        ElMessage.warning('该课题已被其他同学选择，请选择其他课题');
        // 重新加载课题列表，移除已被选择的课题
        await loadTopics();
      } else if (errorMessage.includes('系统繁忙')) {
        ElMessage.warning('系统繁忙，请稍后重试');
      } else if (errorMessage.includes('已经选择了课题')) {
        ElMessage.warning('您已经选择了课题，无法重复选择');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        ElMessage.warning('请求超时，请检查网络连接或稍后重试');
      } else {
        ElMessage.error(errorMessage);
      }
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    ElMessage.info('已取消选择');
  });
};
</script>

<style scoped>
.empty-state {
  margin-top: 40px;
  text-align: center;
}
</style>
