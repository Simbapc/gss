<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="card-header">
                    <span>高校毕业生在线选题系统</span>
                </div>
            </template>
            <el-form :model="loginForm" @submit.prevent="handleLogin">
                <el-form-item label="账号">
                    <el-input v-model="loginForm.username" placeholder="请输入学号/工号"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" native-type="submit" style="width: 100%;">登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const loginForm = reactive({
    username: '',
    password: '',
});

const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        ElMessage.warning('请输入账号和密码');
        return;
    }
    try {
        await authStore.login(loginForm);
        ElMessage.success('登录成功');
    } catch (error) {
        // 错误消息已在axios拦截器中处理
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-card {
    width: 400px;
}

.card-header {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
}
</style>