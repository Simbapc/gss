<template>
    <div>
    <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="handleCreate">新增用户</el-button>
        <el-button type="success" @click="handleImport" style="margin-left: 10px;">批量导入学生</el-button>
    </div>

    <!-- 搜索和分页 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center;">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索用户名或姓名"
                style="width: 300px; margin-right: 10px;"
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

    <el-table :data="users" border v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名/学号" width="120" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="major" label="专业" width="150" align="center">
                <template #default="scope">
                    <el-tag v-if="scope.row.major" type="info" effect="plain">
                        {{ scope.row.major }}
                    </el-tag>
                    <span v-else style="color: #999;">-</span>
                </template>
            </el-table-column>
            <el-table-column prop="role" label="角色" width="120" align="center">
                <template #default="scope">
                    <el-tag :type="roleTagType(scope.row.role)">
                        {{ roleText(scope.row.role) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
                <template #default="scope">
                    <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-popconfirm title="确定要删除此用户吗?" @confirm="handleDelete(scope.row.id)">
                        <template #reference><el-button size="small" type="danger">删除</el-button></template>
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

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%">
            <el-form :model="form" label-width="80px" @submit.prevent="handleSubmit">
                <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
                <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
                <el-form-item label="密码"><el-input v-model="form.password" type="password" placeholder="不修改则留空"
                        autocomplete="new-password" /></el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="form.role" placeholder="请选择角色">
                        <el-option label="学生" value="student" />
                        <el-option label="教师" value="teacher" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
                <el-form-item label="专业" v-if="form.role === 'student'">
                    <el-select v-model="form.major" placeholder="请选择专业" clearable>
                        <el-option label="信息管理与信息系统" value="信息管理与信息系统" />
                        <el-option label="电子商务" value="电子商务" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>

        <!-- Excel导入对话框 -->
        <el-dialog v-model="importDialogVisible" title="批量导入学生" width="500px">
            <div>
                <p style="margin-bottom: 15px; color: #666;">
                    <strong>Excel文件格式要求：</strong><br>
                    - 第一列：学号（用户名）<br>
                    - 第二列：学生姓名<br>
                    - 第三列：专业（可选：信息管理与信息系统、电子商务）<br>
                    - 第一行为表头，从第二行开始为数据<br>
                    - 密码默认为学号，角色默认为学生
                </p>
                <div style="margin-bottom: 15px;">
                    <el-link type="primary" href="/api/download/template" target="_blank" download="学生信息导入模板.xlsx">
                        📥 下载Excel模板
                    </el-link>
                </div>
                <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :on-change="handleFileChange"
                    :show-file-list="false"
                    accept=".xlsx,.xls"
                    drag
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        将Excel文件拖到此处，或<em>点击上传</em>
                    </div>
                </el-upload>
                <div v-if="previewData.length > 0" style="margin-top: 20px;">
                    <h4>预览数据 (共{{ previewData.length }}条):</h4>
                    <el-table :data="previewData" border max-height="200">
                        <el-table-column prop="username" label="学号" />
                        <el-table-column prop="name" label="姓名" />
                        <el-table-column prop="major" label="专业">
                            <template #default="scope">
                                <el-tag v-if="scope.row.major" type="info" effect="plain" size="small">
                                    {{ scope.row.major }}
                                </el-tag>
                                <span v-else style="color: #999;">-</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="importDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleImportSubmit" :loading="importLoading" :disabled="previewData.length === 0">
                    确认导入
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../../api/modules/admin';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';

const users = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = reactive({ id: null, username: '', name: '', password: '', role: 'student' });

// 搜索和分页相关变量
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref('10');
const total = ref(0);

// 用于显示中文角色名
const roleText = (role) => ({ student: '学生', teacher: '教师', admin: '管理员' }[role] || '未知');

// 【修复关键】: 新增一个函数，专门根据角色返回正确的 tag type
const roleTagType = (role) => {
    switch (role) {
        case 'admin':
            return 'danger';
        case 'teacher':
            return 'success';
        case 'student':
            return 'primary'; // 为学生角色提供一个有效的 type
        default:
            return 'info'; // 为未知角色提供一个默认 type
    }
};


const loadUsers = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            search: searchKeyword.value
        };
        const res = await fetchAllUsers(params);
        users.value = res.data.users;
        total.value = res.data.pagination.total;
    } catch (error) {
        console.error("加载用户列表失败:", error);
        ElMessage.error("用户数据加载失败");
    } finally {
        loading.value = false;
    }
};

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1;
    loadUsers();
};

// 分页大小改变处理
const handlePageSizeChange = () => {
    currentPage.value = 1;
    loadUsers();
};

// 页码改变处理
const handleCurrentChange = (page) => {
    currentPage.value = page;
    loadUsers();
};

onMounted(loadUsers);

const resetForm = () => { Object.assign(form, { id: null, username: '', name: '', password: '', role: 'student' }); };

const handleCreate = () => {
    resetForm();
    dialogTitle.value = '新增用户';
    dialogVisible.value = true;
};

const handleEdit = (row) => {
    resetForm();
    Object.assign(form, { ...row, password: '' });
    dialogTitle.value = '编辑用户';
    dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    const payload = { ...form };
    
    // 验证必填字段
    if (!payload.username || !payload.username.trim()) {
      ElMessage.warning('用户名不能为空');
      return;
    }
    if (!payload.name || !payload.name.trim()) {
      ElMessage.warning('姓名不能为空');
      return;
    }
    if (!payload.role) {
      ElMessage.warning('请选择角色');
      return;
    }
    
    if (form.id) {
      // 编辑用户：如果密码为空，则不更新密码字段
      if (!payload.password) {
        delete payload.password;
      }
      await updateUser(form.id, payload);
      ElMessage.success('更新成功');
    } else {
      // 创建用户：密码不能为空
      if (!payload.password) {
        ElMessage.warning('创建用户时密码不能为空');
        return;
      }
      await createUser(payload);
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    await loadUsers();
  } catch (error) {
    console.error("提交失败:", error);
    const message = error.response?.data?.message || '操作失败，请检查输入或联系管理员';
    ElMessage.error(message);
  }
};

const handleDelete = async (userId) => {
  try {
    await deleteUser(userId);
    ElMessage.success('删除成功');
    await loadUsers();
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败");
  }
};

// Excel导入相关变量和函数
const importDialogVisible = ref(false);
const importLoading = ref(false);
const previewData = ref([]);
const uploadRef = ref();

// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true;
  previewData.value = [];
};

// 处理文件选择
const handleFileChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 使用对象格式解析，这样可以根据列名来获取数据
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log('解析的Excel数据:', jsonData);
      
      // 处理数据
      const students = [];
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // 根据可能的列名来获取数据
        const username = row['学号'] || row['用户名'] || row['username'] || row['学号/用户名'] || '';
        const name = row['姓名'] || row['name'] || row['学生姓名'] || '';
        const major = row['专业'] || row['major'] || row['学生专业'] || '';
        
        if (username && name) {
          // 验证专业值是否在允许的范围内
          let validMajor = '';
          if (major) {
            const majorValue = String(major).trim();
            if (majorValue === '信息管理与信息系统' || majorValue === '电子商务') {
              validMajor = majorValue;
            } else {
              console.warn(`无效的专业值: ${majorValue}，将忽略专业信息`);
            }
          }
          
          students.push({
            username: String(username).trim(), // 学号
            name: String(name).trim(),         // 姓名
            password: String(username).trim(), // 密码默认为学号
            role: 'student',                   // 角色默认为学生
            major: validMajor                  // 专业信息
          });
        }
      }
      
      previewData.value = students;
      
      if (students.length === 0) {
        ElMessage.warning('未找到有效的学生数据，请检查Excel文件格式和列名');
      } else {
        ElMessage.success(`成功解析 ${students.length} 条学生数据`);
      }
    } catch (error) {
      console.error('Excel解析失败:', error);
      ElMessage.error('Excel文件解析失败，请检查文件格式');
    }
  };
  reader.readAsArrayBuffer(file.raw);
};

// 提交导入
const handleImportSubmit = async () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('没有可导入的数据');
    return;
  }

  importLoading.value = true;
  try {
    // 批量创建用户
    const promises = previewData.value.map(student => 
      createUser(student).catch(error => {
        // 如果用户已存在，返回错误信息
        return { error: true, message: error.response?.data?.message || '创建失败', username: student.username };
      })
    );

    const results = await Promise.all(promises);
    
    // 统计结果
    const successCount = results.filter(result => !result?.error).length;
    const errorCount = results.filter(result => result?.error).length;
    
    if (errorCount > 0) {
      const errorUsers = results.filter(result => result?.error).map(r => r.username);
      ElMessage.warning(`成功导入 ${successCount} 个用户，${errorCount} 个用户导入失败（可能已存在）：${errorUsers.join(', ')}`);
    } else {
      ElMessage.success(`成功导入 ${successCount} 个学生用户`);
    }
    
    // 关闭对话框并刷新列表
    importDialogVisible.value = false;
    previewData.value = [];
    await loadUsers();
    
  } catch (error) {
    console.error('批量导入失败:', error);
    ElMessage.error('批量导入失败，请稍后重试');
  } finally {
    importLoading.value = false;
  }
};
</script>
