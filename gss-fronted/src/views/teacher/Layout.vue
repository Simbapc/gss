<template>
    <el-container style="height: 100vh;">
        <el-aside width="200px" style="background-color: #545c64;">
            <!-- 
        问题来源：这里的 :default-active="activeMenu" 需要在 <script> 中找到 activeMenu 的定义
      -->
            <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" background-color="#545c64"
                text-color="#fff" active-text-color="#ffd04b" router>
                <div class="menu-title">教师工作台</div>

                <el-menu-item index="/teacher/topics">
                    <el-icon><el-icon-document /></el-icon>
                    <span>我的课题</span>
                </el-menu-item>

                <el-menu-item index="/teacher/selections">
                    <el-icon><el-icon-finished /></el-icon>
                    <span>选题管理</span>
                </el-menu-item>

            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <span>高校毕业生在线选题系统</span>
                <div>
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
                </div>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
    <!-- 引入 ProfileEditor 组件 -->
    <ProfileEditor ref="profileEditorRef" />
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Document as ElIconDocument, Finished as ElIconFinished, ArrowDown } from '@element-plus/icons-vue';

import ProfileEditor from '../../components/ProfileEditor.vue'; // 引入组件

const authStore = useAuthStore();
const route = useRoute();

// 【修复关键】: 确保 activeMenu 被正确定义为一个计算属性。
// 它会追踪当前路由的路径（route.path），并将其值赋给 activeMenu。
// 这样，当路由变化时，activeMenu 的值也会自动更新，菜单高亮状态随之改变。
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
    color: white;
    /* 教师端 Header 颜色不同 */
    display: flex;
    align-items: center;
}
</style>