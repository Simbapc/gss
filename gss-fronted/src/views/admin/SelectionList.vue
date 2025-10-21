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
        
        <div style="display: flex; align-items: center; gap: 10px;">
            <el-button type="success" @click="handleExport" :loading="exportLoading">
                <el-icon><Download /></el-icon>
                导出Excel
            </el-button>
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
        <el-table-column prop="student.name" label="选择学生" width="120" />
        <el-table-column prop="student.username" label="学生学号" width="120" />
        <el-table-column prop="student.major" label="专业" width="150" align="center">
            <template #default="scope">
                <el-tag v-if="scope.row.student.major" type="info" effect="plain">
                    {{ scope.row.student.major }}
                </el-tag>
                <span v-else style="color: #999;">-</span>
            </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)" effect="dark">
                    {{ statusText(scope.row.status) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新时间" width="180">
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
