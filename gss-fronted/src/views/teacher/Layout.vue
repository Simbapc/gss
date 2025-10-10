<template>
    <el-container style="height: 100vh;">
        <el-header class="header">
            <span>教师工作台</span>
            <div>
                <span>欢迎您, {{ authStore.user?.name }}</span>
                <el-button type="text" @click="handleLogout" style="color: white; margin-left: 15px;">退出登录</el-button>
            </div>
        </el-header>
        <el-main>
            <router-view />
        </el-main>
    </el-container>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
const authStore = useAuthStore();

const handleLogout = () => {
    authStore.logout();
};
</script>

<style scoped>
.header {
    background-color: #409EFF;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
}
</style>