<template>
    <div>
        <el-button type="primary" @click="handleCreate" style="margin-bottom: 20px;">新增用户</el-button>
        <el-table :data="users" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名/学号" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="role" label="角色">
                <template #default="scope">
                    <!-- 
            【修复关键】: 确保所有角色都有一个有效的 type。
            之前学生角色 (student) 会导致 type 为空字符串 ""，现在我们给它 'primary'。
            或者，我们可以创建一个函数来专门处理这个问题，让模板更简洁。
          -->
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
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../../api/modules/admin';
import { ElMessage } from 'element-plus';

const users = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = reactive({ id: null, username: '', name: '', password: '', role: 'student' });

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
        const res = await fetchAllUsers();
        users.value = res.data;
    } catch (error) {
        console.error("加载用户列表失败:", error);
        ElMessage.error("用户数据加载失败");
    } finally {
        loading.value = false;
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
        if (!payload.password) delete payload.password;

        if (form.id) {
            await updateUser(form.id, payload);
            ElMessage.success('更新成功');
        } else {
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
</script>