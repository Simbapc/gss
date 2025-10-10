<template>
    <el-container style="height: 100vh;">
        <el-aside width="200px" style="background-color: #545c64;">
            <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" background-color="#545c64"
                text-color="#fff" active-text-color="#ffd04b" router>
                <div class="menu-title">学生工作台</div>
                <el-menu-item index="/student/topic-list">
                    <el-icon><el-icon-tickets /></el-icon>
                    <span>课题列表</span>
                </el-menu-item>
                <el-menu-item index="/student/my-selection">
                    <el-icon><el-icon-document-checked /></el-icon>
                    <span>我的选题</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <span>高校毕业生在线选题系统</span>
                <div>
                    <span>欢迎您, {{ authStore.user?.name }}</span>
                    <el-button type="text" @click="handleLogout"
                        style="color: white; margin-left: 15px;">退出登录</el-button>
                </div>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Tickets as ElIconTickets, DocumentChecked as ElIconDocumentChecked } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const route = useRoute();

const activeMenu = computed(() => route.path);

const handleLogout = () => {
    authStore.logout();
};
</script>

<style scoped>
.menu-title {
    color: white;
    font-size: 20px;
    text-align: center;
    padding: 20px 0;
}

.header {
    background-color: #409EFF;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
}

.el-menu {
    border-right: none;
}
</style>