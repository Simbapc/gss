<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- 侧边栏 -->
        <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div class="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-primary-800 to-primary-900">
                <!-- Logo区域 -->
                <div class="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-primary-900">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-2">
                            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9 5m-9 5l-9-5"></path>
                            </svg>
                        </div>
                        <span class="text-white font-bold text-lg">教师工作台</span>
                    </div>
                </div>
                
                <!-- 导航菜单 -->
                <div class="flex-1 flex flex-col overflow-y-auto py-4">
                    <nav class="flex-1 px-4 space-y-2">
                        <router-link
                            v-for="item in navigation"
                            :key="item.name"
                            :to="item.href"
                            :class="[
                                item.current 
                                    ? 'bg-primary-700 text-white border-l-4 border-primary-300' 
                                    : 'text-primary-100 hover:bg-primary-700 hover:text-white border-l-4 border-transparent',
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200'
                            ]"
                        >
                            <component 
                                :is="item.icon" 
                                :class="[
                                    item.current ? 'text-primary-300' : 'text-primary-400 group-hover:text-primary-300',
                                    'flex-shrink-0 h-5 w-5 mr-3'
                                ]" 
                                aria-hidden="true" 
                            />
                            {{ item.name }}
                        </router-link>
                    </nav>
                </div>
            </div>
        </div>

        <!-- 移动端侧边栏 -->
        <div class="lg:hidden">
            <!-- 移动端侧边栏实现 -->
        </div>

        <!-- 主内容区域 -->
        <div class="lg:pl-64 flex flex-col flex-1">
            <!-- 顶部导航栏 -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
                    <!-- 移动端菜单按钮 -->
                    <button class="lg:hidden -ml-2 mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    <!-- 标题 -->
                    <div class="flex-1">
                        <h1 class="text-xl font-semibold text-gray-900">经管信息管理系毕业生在线选题系统</h1>
                    </div>
                    
                    <!-- 用户菜单 -->
                    <div class="flex items-center space-x-4">
                        <el-dropdown>
                            <span class="el-dropdown-link flex items-center space-x-2 cursor-pointer">
                                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">
                                        {{ authStore.user?.name?.charAt(0) || 'T' }}
                                    </span>
                                </div>
                                <span class="text-gray-700 font-medium hidden sm:block">
                                    欢迎您, {{ authStore.user?.name }}
                                </span>
                                <el-icon class="el-icon--right text-gray-400"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="openProfile" class="flex items-center space-x-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>个人中心</span>
                                    </el-dropdown-item>
                                    <el-dropdown-item divided @click="authStore.logout()" class="flex items-center space-x-2 text-red-600">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>退出登录</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </header>

            <!-- 主要内容 -->
            <main class="flex-1 overflow-auto">
                <div class="py-6">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <router-view />
                    </div>
                </div>
            </main>
        </div>
    </div>
    
    <!-- 引入 ProfileEditor 组件 -->
    <ProfileEditor ref="profileEditorRef" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { Document as ElIconDocument, Finished as ElIconFinished, Operation as ElIconOperation, ArrowDown } from '@element-plus/icons-vue';
import ProfileEditor from '../../components/ProfileEditor.vue';

const authStore = useAuthStore();
const route = useRoute();
const profileEditorRef = ref(null);

// 导航菜单配置
const navigation = computed(() => [
  { 
    name: '我的课题', 
    href: '/teacher/topics', 
    icon: ElIconDocument,
    current: route.path === '/teacher/topics'
  },
  { 
    name: '选题管理', 
    href: '/teacher/selections', 
    icon: ElIconOperation,
    current: route.path === '/teacher/selections'
  },
  { 
    name: '已通过选题', 
    href: '/teacher/approved-selections', 
    icon: ElIconFinished,
    current: route.path === '/teacher/approved-selections'
  }
]);

const openProfile = () => {
    profileEditorRef.value?.open();
};
</script>

<style scoped>
/* 可以添加一些自定义样式，如果需要的话 */
</style>
