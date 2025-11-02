<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 页面头部 -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div class="flex justify-between items-center py-3 sm:py-4">
                    <div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">用户管理</h1>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">管理系统用户账号和权限</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- 统计信息 -->
                        <div class="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                            <span>共 {{ total }} 个用户</span>
                            <span class="text-gray-300">|</span>
                            <span>当前页: {{ users.length }} 个</span>
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
                            @click="handleCreate" 
                            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            新增用户
                        </button>
                        <button 
                            @click="handleImport" 
                            class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            批量导入
                        </button>
                        <button 
                            v-if="roleFilter === 'student'"
                            @click="handleBatchDelete" 
                            :class="[
                                'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
                                selectedUsers.length > 0 
                                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            ]"
                            :disabled="selectedUsers.length === 0"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            批量删除 {{ selectedUsers.length > 0 ? `(${selectedUsers.length})` : '' }}
                        </button>
                    </div>

                    <!-- 右侧搜索和分页控制 -->
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <!-- 搜索框 -->
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                v-model="searchKeyword" 
                                placeholder="搜索用户名或姓名..." 
                                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                                @keyup.enter="handleSearch" 
                                @input="handleSearchInput" 
                            />
                        </div>

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

                <!-- 角色选项卡 -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex flex-wrap gap-2">
                        <button 
                            @click="handleRoleTabChange('')" 
                            :class="[
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                roleFilter === '' 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            ]"
                        >
                            全部用户
                        </button>
                        <button 
                            @click="handleRoleTabChange('admin')" 
                            :class="[
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                roleFilter === 'admin' 
                                    ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            ]"
                        >
                            管理员
                        </button>
                        <button 
                            @click="handleRoleTabChange('teacher')" 
                            :class="[
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                roleFilter === 'teacher' 
                                    ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            ]"
                        >
                            教师
                        </button>
                        <button 
                            @click="handleRoleTabChange('student')" 
                            :class="[
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                roleFilter === 'student' 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm' 
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            ]"
                        >
                            学生
                        </button>
                    </div>
                </div>
            </div>

            <!-- 用户列表 -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <!-- 加载状态 -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="flex flex-col items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p class="mt-3 text-sm text-gray-500">加载中...</p>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else-if="users.length === 0" class="flex justify-center items-center py-12">
                    <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无用户</h3>
                        <p class="mt-1 text-sm text-gray-500">当前筛选条件下没有找到用户</p>
                    </div>
                </div>

                <!-- 用户表格 -->
                <div v-else>
                    <!-- 移动端卡片布局 -->
                    <div class="lg:hidden space-y-4 p-4">
                        <div 
                            v-for="user in users" 
                            :key="user.id"
                            class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center space-x-3">
                                        <div v-if="roleFilter === 'student'" class="flex-shrink-0">
                                            <input 
                                                type="checkbox" 
                                                :checked="selectedUsers.includes(user.id)" 
                                                @change="toggleUserSelection(user.id)"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div>
                                            <h3 class="text-sm font-medium text-gray-900">{{ user.name }}</h3>
                                            <p class="text-sm text-gray-500">{{ user.username }}</p>
                                        </div>
                                    </div>
                                    <div class="mt-2 flex items-center space-x-2">
                                        <span :class="[
                                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                            'bg-purple-100 text-purple-800'
                                        ]">
                                            {{ roleText(user.role) }}
                                        </span>
                                        <span v-if="user.major" class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {{ user.major }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex space-x-2 ml-4">
                                    <button 
                                        @click="handleEdit(user)"
                                        class="inline-flex items-center p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        @click="confirmDelete(user.id)"
                                        class="inline-flex items-center p-1.5 border border-red-300 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
                                    <th v-if="roleFilter === 'student'" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                        <input 
                                            type="checkbox" 
                                            :checked="isAllSelected" 
                                            @change="toggleSelectAll"
                                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名/学号</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">专业</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr 
                                    v-for="user in users" 
                                    :key="user.id" 
                                    class="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td v-if="roleFilter === 'student'" class="px-6 py-4 whitespace-nowrap text-center">
                                        <input 
                                            type="checkbox" 
                                            :checked="selectedUsers.includes(user.id)" 
                                            @change="toggleUserSelection(user.id)"
                                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.id }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.username }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.name }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span v-if="user.major" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {{ user.major }}
                                        </span>
                                        <span v-else class="text-gray-400">-</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span :class="[
                                            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                                            'bg-purple-100 text-purple-800'
                                        ]">
                                            {{ roleText(user.role) }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div class="flex justify-center space-x-2">
                                            <button 
                                                @click="handleEdit(user)"
                                                class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors duration-200"
                                            >
                                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                编辑
                                            </button>
                                            <button 
                                                @click="confirmDelete(user.id)"
                                                class="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors duration-200"
                                            >
                                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                删除
                                            </button>
                                        </div>
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
                    <el-input v-model="form.password" type="password" placeholder="不修改则留空" autocomplete="new-password" />
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

// 批量删除相关变量
const selectedUsers = ref([]);
const batchDeleteLoading = ref(false);

// 计算是否全选
const isAllSelected = ref(false);

// 用于显示中文角色名
const roleText = (role) => ({ student: '学生', teacher: '教师', admin: '管理员' }[role] || '未知');

// 角色选项卡切换处理
const handleRoleTabChange = (role) => {
    roleFilter.value = role;
    currentPage.value = 1;
    selectedUsers.value = []; // 切换角色时清空选择
    isAllSelected.value = false; // 重置全选状态
    loadUsers();
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
        // 数据加载完成后更新全选状态
        updateSelectAllState();
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

// 批量删除相关函数
const toggleUserSelection = (userId) => {
    const index = selectedUsers.value.indexOf(userId);
    if (index > -1) {
        selectedUsers.value.splice(index, 1);
    } else {
        selectedUsers.value.push(userId);
    }
    updateSelectAllState();
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        // 取消全选
        selectedUsers.value = [];
    } else {
        // 全选当前页面的学生用户
        selectedUsers.value = users.value
            .filter(user => user.role === 'student')
            .map(user => user.id);
    }
    updateSelectAllState();
};

const updateSelectAllState = () => {
    const studentUsers = users.value.filter(user => user.role === 'student');
    if (studentUsers.length === 0) {
        isAllSelected.value = false;
        return;
    }
    isAllSelected.value = selectedUsers.value.length === studentUsers.length;
};

const handleBatchDelete = () => {
    if (selectedUsers.value.length === 0) {
        ElMessage.warning('请先选择要删除的学生');
        return;
    }

    const confirmMessage = `确定要删除选中的 ${selectedUsers.value.length} 个学生吗？此操作不可恢复！`;
    if (confirm(confirmMessage)) {
        executeBatchDelete();
    }
};

const executeBatchDelete = async () => {
    batchDeleteLoading.value = true;
    try {
        // 批量删除用户
        const promises = selectedUsers.value.map(userId =>
            deleteUser(userId).catch(error => {
                // 如果删除失败，返回错误信息
                return { error: true, message: error.response?.data?.message || '删除失败', userId };
            })
        );

        const results = await Promise.all(promises);

        // 统计结果
        const successCount = results.filter(result => !result?.error).length;
        const errorCount = results.filter(result => result?.error).length;

        if (errorCount > 0) {
            const errorUsers = results.filter(result => result?.error).map(r => r.userId);
            ElMessage.warning(`成功删除 ${successCount} 个学生，${errorCount} 个学生删除失败：${errorUsers.join(', ')}`);
        } else {
            ElMessage.success(`成功删除 ${successCount} 个学生`);
        }

        // 清空选择并刷新列表
        selectedUsers.value = [];
        await loadUsers();

    } catch (error) {
        console.error('批量删除失败:', error);
        ElMessage.error('批量删除失败，请稍后重试');
    } finally {
        batchDeleteLoading.value = false;
    }
};
</script>
