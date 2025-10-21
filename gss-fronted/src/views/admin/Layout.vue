<template>
    <el-container style="height: 100vh;">
        <el-aside width="200px" style="background-color: #304156;">
            <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" background-color="#304156"
                text-color="#bfcbd9" active-text-color="#409EFF" router>
                <div class="menu-title">系统管理</div>
                <el-menu-item index="/admin/users"><el-icon>
                        <User />
                    </el-icon><span>用户管理</span></el-menu-item>
                <el-menu-item index="/admin/topics"><el-icon>
                        <Tickets />
                    </el-icon><span>课题总览</span></el-menu-item>
                <el-menu-item index="/admin/selections"><el-icon>
                        <List />
                    </el-icon><span>选题总览</span></el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <span>经管信息管理系毕业生在线选题系统 - 管理后台</span>
                <div>
                    <span>欢迎您, {{ authStore.user?.name }}</span>
                    <el-button type="text" @click="authStore.logout()"
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
import { User, Tickets, List } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.menu-title {
    color: white;
    font-size: 20px;
    text-align: center;
    padding: 20px 0;
}

.header {
    background-color: #304156;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    border-bottom: 1px solid #4d5d70;
}

.el-menu {
    border-right: none;
}
</style>