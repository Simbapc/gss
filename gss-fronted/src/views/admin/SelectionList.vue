<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 页面头部 -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div class="flex justify-between items-center py-3 sm:py-4">
                    <div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">选题管理</h1>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">管理系统选题记录和审核状态</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- 统计信息 -->
                        <div class="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                            <span>共 {{ total }} 条记录</span>
                            <span class="text-gray-300">|</span>
                            <span>当前页: {{ selections.length }} 条</span>
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
                    <!-- 左侧搜索和筛选 -->
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <!-- 学生搜索 -->
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                v-model="searchKeyword"
                                placeholder="搜索学生姓名或学号..."
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56"
                                @keyup.enter="handleSearch"
                                @input="handleSearchInput"
                            />
                        </div>
                        
                        <!-- 课题搜索 -->
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <input
                                v-model="topicKeyword"
                                placeholder="搜索课题标题..."
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56"
                                @keyup.enter="handleSearch"
                                @input="handleSearchInput"
                            />
                        </div>
                        
                        <!-- 状态筛选 -->
                        <select
                            v-model="statusFilter"
                            @change="handleSearch"
                            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-40"
                        >
                            <option value="">选择状态</option>
                            <option value="pending">待审核</option>
                            <option value="approved">已通过</option>
                            <option value="rejected">已拒绝</option>
                        </select>
                        
                        <button @click="handleSearch" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
                            搜索
                        </button>
                    </div>
                    
                    <!-- 右侧操作和分页控制 -->
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <!-- 导出按钮 -->
                        <button 
                            @click="handleExport" 
                            :disabled="exportLoading" 
                            class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {{ exportLoading ? '导出中...' : '导出Excel' }}
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

            <!-- 选题列表 -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <!-- 加载状态 -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="flex flex-col items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p class="mt-3 text-sm text-gray-500">加载中...</p>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else-if="selections.length === 0" class="flex justify-center items-center py-12">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无选题记录</h3>
                        <p class="mt-1 text-sm text-gray-500">当前筛选条件下没有找到选题记录</p>
                    </div>
                </div>

                <!-- 选题表格 -->
                <div v-else>
                    <!-- 移动端卡片布局 -->
                    <div class="lg:hidden space-y-4 p-4">
                        <div 
                            v-for="selection in selections" 
                            :key="selection.id"
                            class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div class="space-y-3">
                                <!-- 课题信息 -->
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900">{{ selection.topic?.title || '未知课题' }}</h3>
                                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ selection.topic?.description || '暂无描述' }}</p>
                                </div>
                                
                                <!-- 学生信息 -->
                                <div class="flex items-center justify-between text-xs">
                                    <div>
                                        <span class="font-medium text-gray-700">{{ selection.student?.name || '未知学生' }}</span>
                                        <span class="text-gray-500 ml-2">{{ selection.student?.username || '未知学号' }}</span>
                                    </div>
                                    <span v-if="selection.student?.major" class="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {{ selection.student.major }}
                                    </span>
                                </div>
                                
                                <!-- 教师和状态 -->
                                <div class="flex items-center justify-between text-xs">
                                    <span class="text-gray-600">指导教师: {{ selection.topic?.teacher?.name || '未知教师' }}</span>
                                    <span :class="[
                                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                        selection.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        selection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    ]">
                                        {{ statusText(selection.status) }}
                                    </span>
                                </div>
                                
                                <!-- 更新时间 -->
                                <div class="text-xs text-gray-500">
                                    更新: {{ new Date(selection.updatedAt).toLocaleString() }}
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">选择学生</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生学号</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">专业</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">指导教师</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后更新时间</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr 
                                    v-for="selection in selections" 
                                    :key="selection.id" 
                                    class="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td class="px-6 py-4">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">{{ selection.topic?.title || '未知课题' }}</div>
                                            <div class="text-sm text-gray-500 mt-1">{{ selection.topic?.description || '暂无描述' }}</div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{{ selection.student?.name || '未知学生' }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{{ selection.student?.username || '未知学号' }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <span v-if="selection.student?.major" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {{ selection.student.major }}
                                        </span>
                                        <span v-else class="text-gray-400">-</span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-center">{{ selection.topic?.teacher?.name || '未知教师' }}</td>
                                    <td class="px-6 py-4 text-sm text-center">
                                        <span :class="[
                                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                                            selection.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            selection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        ]">
                                            {{ statusText(selection.status) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">{{ new Date(selection.updatedAt).toLocaleString() }}</td>
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAllSelections, exportSelectionsToExcel } from '../../api/modules/admin';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download } from '@element-plus/icons-vue';

const selections = ref([]);
const loading = ref(true);
const exportLoading = ref(false);

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
        console.log(selections.value);
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
  loadSelections();
};

// 导出处理
const handleExport = async () => {
  try {
    exportLoading.value = true;
    
    const params = {
      search: searchKeyword.value,
      topic: topicKeyword.value,
      status: statusFilter.value
    };
    
    const res = await exportSelectionsToExcel(params);
    
    if (res.data.success) {
      // 创建Excel文件并下载
      const data = res.data.data;
      if (data && data.length > 0) {
        // 使用SheetJS库来生成Excel文件
        await generateExcelFile(data);
        ElMessage.success(`成功导出 ${res.data.total} 条选题记录`);
      } else {
        ElMessage.warning('没有数据可导出');
      }
    } else {
      ElMessage.error(res.data.message || '导出失败');
    }
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  } finally {
    exportLoading.value = false;
  }
};

// 生成Excel文件并下载
const generateExcelFile = (data) => {
  return new Promise((resolve) => {
    // 动态导入SheetJS库
    import('xlsx').then((XLSX) => {
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(data);
      
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '选题结果');
      
      // 生成Excel文件并下载
      const fileName = `选题结果_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      resolve();
    }).catch((error) => {
      console.error('加载SheetJS库失败:', error);
      // 如果SheetJS加载失败，使用简单的CSV导出
      exportAsCSV(data);
      resolve();
    });
  });
};

// 备用方案：导出为CSV
const exportAsCSV = (data) => {
  if (!data || data.length === 0) return;
  
  // 获取表头
  const headers = Object.keys(data[0]);
  
  // 生成CSV内容
  let csvContent = '\uFEFF'; // BOM for UTF-8
  csvContent += headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(',') + '\n';
  });
  
  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `选题结果_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(loadSelections);
</script>
