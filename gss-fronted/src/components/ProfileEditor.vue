<template>
    <el-dialog v-model="dialogVisible" title="个人中心" width="30%" @closed="resetForm">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
            <el-form-item label="用户名">
                <el-input :value="authStore.user?.username" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="新密码" prop="password">
                <el-input v-model="form.password" type="password" placeholder="不修改则留空" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确认修改</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { updateProfile } from '../api/modules/user';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const dialogVisible = ref(false);
const formRef = ref(null);

const form = reactive({
    name: '',
    password: '',
});

const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    password: [{ min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
};

// 定义一个 open 方法，供父组件调用
const open = () => {
    form.name = authStore.user?.name || '';
    form.password = '';
    dialogVisible.value = true;
};

// 暴露 open 方法
defineExpose({ open });

const resetForm = () => {
    formRef.value?.resetFields();
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const payload = {
                    name: form.name
                };
                // 只有当用户输入了新密码时，才将其加入到请求体中
                if (form.password) {
                    payload.password = form.password;
                }

                const res = await updateProfile(payload);

                // 使用 Pinia action 更新用户信息
                authStore.updateUser(res.data.user);

                ElMessage.success('个人信息更新成功！');
                dialogVisible.value = false;
            } catch (error) {
                console.error("更新失败:", error);
                ElMessage.error(error.response?.data?.message || '更新失败');
            }
        }
    });
};
</script>