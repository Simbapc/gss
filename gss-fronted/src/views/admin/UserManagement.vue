<template>
    <div class="p-4 sm:p-6">
        <!-- 操作按钮区域 -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
            <button @click="handleCreate" class="btn-primary w-full sm:w-auto">新增用户</button>
            <button @click="handleImport" class="btn-secondary w-full sm:w-auto">批量导入学生</button>
        </div>

        <!-- 搜索和分页 -->
        <div class="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <div class="relative w-full sm:w-64">
                    <input v-model="searchKeyword" placeholder="搜索用户名或姓名" class="form-input pr-10"
                        @keyup.enter="handleSearch" @input="handleSearchInput" />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <select v-model="roleFilter" @change="handleSearch" class="form-input w-full sm:w-40">
                    <option value="">所有角色</option>
                    <option value="admin">管理员</option>
                    <option value="teacher">教师</option>
                    <option value="student">学生</option>
                </select>
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

        <!-- 用户列表 -->
        <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <div v-else>
            <!-- 移动端卡片布局 -->
            <div class="space-y-4 lg:hidden">
                <div v-for="user in users" :key="user.id" :class="[
                    'card border-l-4 transition-colors duration-200',
                    user.role === 'admin' ? 'border-red-500 bg-red-50' :
                    user.role === 'teacher' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                ]">
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h3 :class="[
                                    'font-medium',
                                    user.role === 'admin' ? 'text-red-900' :
                                    user.role === 'teacher' ? 'text-green-900' :
                                    'text-blue-900'
                                ]">{{ user.name }}</h3>
                                <p :class="[
                                    'text-sm',
                                    user.role === 'admin' ? 'text-red-700' :
                                    user.role === 'teacher' ? 'text-green-700' :
                                    'text-blue-700'
                                ]">{{ user.username }}</p>
                            </div>
                            <span :class="[
                                'px-3 py-1 text-xs font-bold rounded-full shadow-sm',
                                user.role === 'admin' ? 'bg-red-500 text-white' :
                                user.role === 'teacher' ? 'bg-green-500 text-white' :
                                'bg-blue-500 text-white'
                            ]">
                                {{ roleText(user.role) }}
                            </span>
                        </div>

                        <div class="flex items-center justify-between text-sm mb-3" :class="[
                            user.role === 'admin' ? 'text-red-700' :
                            user.role === 'teacher' ? 'text-green-700' :
                            'text-blue-700'
                        ]">
                            <span>专业: {{ user.major || '-' }}</span>
                            <span>ID: {{ user.id }}</span>
                        </div>

                        <div class="flex space-x-2">
                            <button @click="handleEdit(user)" :class="[
                                'flex-1 py-2 text-sm rounded-lg transition-colors duration-200',
                                user.role === 'admin' ? 'bg-red-200 hover:bg-red-300 text-red-800' :
                                user.role === 'teacher' ? 'bg-green-200 hover:bg-green-300 text-green-800' :
                                'bg-blue-200 hover:bg-blue-300 text-blue-800'
                            ]">编辑</button>
                            <button @click="confirmDelete(user.id)"
                                class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200">
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
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                用户名/学号</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                姓名</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                专业</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                角色</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="user in users" :key="user.id" :class="[
                            'transition-colors duration-200',
                            user.role === 'admin' ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' :
                            user.role === 'teacher' ? 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500' :
                            'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                        ]">
                            <td class="px-4 py-3 text-sm font-medium" :class="[
                                user.role === 'admin' ? 'text-red-900' :
                                user.role === 'teacher' ? 'text-green-900' :
                                'text-blue-900'
                            ]">{{ user.id }}</td>
                            <td class="px-4 py-3 text-sm font-medium" :class="[
                                user.role === 'admin' ? 'text-red-900' :
                                user.role === 'teacher' ? 'text-green-900' :
                                'text-blue-900'
                            ]">{{ user.username }}</td>
                            <td class="px-4 py-3 text-sm font-medium" :class="[
                                user.role === 'admin' ? 'text-red-900' :
                                user.role === 'teacher' ? 'text-green-900' :
                                'text-blue-900'
                            ]">{{ user.name }}</td>
                            <td class="px-4 py-3 text-sm text-center">
                                <span v-if="user.major" :class="[
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    user.role === 'admin' ? 'bg-red-200 text-red-800' :
                                    user.role === 'teacher' ? 'bg-green-200 text-green-800' :
                                    'bg-blue-200 text-blue-800'
                                ]">
                                    {{ user.major }}
                                </span>
                                <span v-else class="text-gray-400">-</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-center">
                                <span :class="[
                                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm',
                                    user.role === 'admin' ? 'bg-red-500 text-white' :
                                    user.role === 'teacher' ? 'bg-green-500 text-white' :
                                    'bg-blue-500 text-white'
                                ]">
                                    {{ roleText(user.role) }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-center">
                                <div class="flex justify-center space-x-2">
                                    <button @click="handleEdit(user)" :class="[
                                        'py-1 px-3 rounded text-sm transition-colors duration-200',
                                        user.role === 'admin' ? 'bg-red-200 hover:bg-red-300 text-red-800' :
                                        user.role === 'teacher' ? 'bg-green-200 hover:bg-green-300 text-green-800' :
                                        'bg-blue-200 hover:bg-blue-300 text-blue-800'
                                    ]">编辑</button>
                                    <button @click="confirmDelete(user.id)"
                                        class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200">
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 分页组件 -->
        <div class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div class="text-sm text-gray-700">
                显示第 {{ (currentPage - 1) * parseInt(pageSize) + 1 }} 到 {{ Math.min(currentPage * parseInt(pageSize),
                total) }} 条，共 {{ total }} 条记录
            </div>
            <div class="flex items-center space-x-2">
                <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage <= 1"
                    class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    上一页
                </button>
                <span class="px-3 py-2 text-sm text-gray-700">
                    第 {{ currentPage }} 页
                </span>
                <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage * parseInt(pageSize) >= total"
                    class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    下一页
                </button>
            </div>
        </div>

        <!-- 用户编辑/新增对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" class="w-full sm:max-w-md lg:max-w-lg mx-auto">
            <el-form :model="form" label-width="80px" @submit.prevent="handleSubmit">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" />
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="不修改则留空"
                        autocomplete="new-password" />
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="form.role" placeholder="请选择角色" class="w-full">
                        <el-option label="学生" value="student" />
                        <el-option label="教师" value="teacher" />
                        <el-option label="管理员" value="admin" />
                    </el-select>
                </el-form-item>
                <el-form-item label="专业" v-if="form.role === 'student'">
                    <el-select v-model="form.major" placeholder="请选择专业" clearable class="w-full">
                        <el-option label="信息管理与信息系统" value="信息管理与信息系统" />
                        <el-option label="电子商务" value="电子商务" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <el-button @click="dialogVisible = false" class="w-full sm:w-auto">取消</el-button>
                    <el-button type="primary" @click="handleSubmit" class="w-full sm:w-auto">确定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- Excel导入对话框 -->
        <el-dialog v-model="importDialogVisible" title="批量导入学生" class="w-full sm:max-w-lg lg:max-w-xl mx-auto">
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600 mb-0">
                        <strong class="block mb-2">Excel文件格式要求：</strong>
                        - 第一列：学号（用户名）<br>
                        - 第二列：学生姓名<br>
                        - 第三列：专业（可选：信息管理与信息系统、电子商务）<br>
                        - 第一行为表头，从第二行开始为数据<br>
                        - 密码默认为学号，角色默认为学生
                    </p>
                </div>
                <div>
                    <el-link type="primary" href="/api/download/template" target="_blank" download="学生信息导入模板.xlsx">
                        📥 下载Excel模板
                    </el-link>
                </div>
                <el-upload ref="uploadRef" :auto-upload="false" :on-change="handleFileChange" :show-file-list="false"
                    accept=".xlsx,.xls" drag class="w-full">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        将Excel文件拖到此处，或<em>点击上传</em>
                    </div>
                </el-upload>
                <div v-if="previewData.length > 0" class="mt-4">
                    <h4 class="text-sm font-medium mb-2">预览数据 (共{{ previewData.length }}条):</h4>
                    <div class="overflow-x-auto">
                        <el-table :data="previewData" border max-height="200" class="min-w-full">
                            <el-table-column prop="username" label="学号" width="120" />
                            <el-table-column prop="name" label="姓名" width="100" />
                            <el-table-column prop="major" label="专业" width="140">
                                <template #default="scope">
                                    <el-tag v-if="scope.row.major" type="info" effect="plain" size="small">
                                        {{ scope.row.major }}
                                    </el-tag>
                                    <span v-else class="text-gray-400 text-sm">-</span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <el-button @click="importDialogVisible = false" class="w-full sm:w-auto">取消</el-button>
                    <el-button type="primary" @click="handleImportSubmit" :loading="importLoading"
                        :disabled="previewData.length === 0" class="w-full sm:w-auto">
                        确认导入
                    </el-button>
                </div>
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
const roleFilter = ref('');
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
            search: searchKeyword.value,
            role: roleFilter.value
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
    loadUsers();
};

// 删除确认
const confirmDelete = (userId) => {
    if (confirm('确定要删除此用户吗？')) {
        handleDelete(userId);
    }
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
