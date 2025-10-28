// src/views/admin/SelectionList.vue
<template>
    <div class="p-4 sm:p-6">
        <!-- 搜索和分页 -->
        <div class="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div class="relative w-full sm:w-56">
                    <input
                        v-model="searchKeyword"
                        placeholder="搜索学生姓名或学号"
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
                <div class="relative w-full sm:w-56">
                    <input
                        v-model="topicKeyword"
                        placeholder="搜索课题标题"
                        class="form-input pr-10"
                        @keyup.enter="handleSearch"
                        @input="handleSearchInput"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>
                <select
                    v-model="statusFilter"
                    @change="handleSearch"
                    class="form-input w-full sm:w-40"
                >
                    <option value="">选择状态</option>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                </select>
                <button @click="handleSearch" class="btn-primary w-full sm:w-auto">搜索</button>
            </div>
            
            <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <button @click="handleExport" :disabled="exportLoading" class="btn-success w-full sm:w-auto flex items-center justify-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ exportLoading ? '导出中...' : '导出Excel' }}
                </button>
                <div class="flex items-center space-x-3">
                    <span class="text-sm text-gray-600 whitespace-nowrap">每页显示:</span>
                    <select v-model="pageSize" @change="handlePageSizeChange" class="form-input w-24">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 选题列表 -->
        <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <div v-else>
            <!-- 移动端卡片布局 -->
            <div class="space-y-4 lg:hidden">
                <div v-for="selection in selections" :key="selection.id" class="card">
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-900 text-sm leading-tight">{{ selection.topic?.title || '未知课题' }}</h3>
                                <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ selection.topic?.description || '暂无描述' }}</p>
                            </div>
                            <span :class="[
                                'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2',
                                selection.status === 'approved' ? 'bg-green-100 text-green-800' :
                                selection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            ]">
                                {{ statusText(selection.status) }}
                            </span>
                        </div>
                        
                        <div class="space-y-2 text-sm text-gray-600">
                            <div class="flex items-center">
                                <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {{ selection.student?.name || '未知学生' }} ({{ selection.student?.username || '未知学号' }})
                            </div>
                            <div class="flex items-center">
                                <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {{ selection.student?.major || '未知专业' }}
                            </div>
                            <div class="flex items-center">
                                <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                指导教师: {{ selection.topic?.teacher?.name || '未知教师' }}
                            </div>
                            <div class="flex items-center">
                                <svg class="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {{ new Date(selection.updatedAt).toLocaleString() }}
                            </div>
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
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">选择学生</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生学号</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">专业</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">指导教师</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后更新时间</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="selection in selections" :key="selection.id" class="hover:bg-gray-50">
                            <td class="px-4 py-3">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{{ selection.topic?.title || '未知课题' }}</div>
                                    <div class="text-sm text-gray-500 mt-1">{{ selection.topic?.description || '暂无描述' }}</div>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900">{{ selection.student?.name || '未知学生' }}</td>
                            <td class="px-4 py-3 text-sm text-gray-900">{{ selection.student?.username || '未知学号' }}</td>
                            <td class="px-4 py-3 text-sm text-center">
                                <span v-if="selection.student?.major" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {{ selection.student.major }}
                                </span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-center">{{ selection.topic?.teacher?.name || '未知教师' }}</td>
                            <td class="px-4 py-3 text-sm text-center">
                                <span :class="[
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    selection.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    selection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                ]">
                                    {{ statusText(selection.status) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900">{{ new Date(selection.updatedAt).toLocaleString() }}</td>
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
