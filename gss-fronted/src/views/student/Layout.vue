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
                <!-- 使用 Dropdown 组件 -->
                <el-dropdown>
                    <span class="el-dropdown-link">
                        欢迎您, {{ authStore.user?.name }}
                        <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="openProfile">个人中心</el-dropdown-item>
                            <el-dropdown-item divided @click="authStore.logout()">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
    <ProfileEditor ref="profileEditorRef" />
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Document as ElIconDocument, Collection as ElIconCollection, ArrowDown } from '@element-plus/icons-vue';
import { Tickets as ElIconTickets, DocumentChecked as ElIconDocumentChecked } from '@element-plus/icons-vue';
import ProfileEditor from '../../components/ProfileEditor.vue'; // 引入组件


const authStore = useAuthStore();
const route = useRoute();

const activeMenu = computed(() => route.path);

const profileEditorRef = ref(null); // 创建 ref
// 调用子组件的 open 方法
const openProfile = () => {
    profileEditorRef.value?.open();
};

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

.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary-light-9);
    display: flex;
    align-items: center;
}
</style>