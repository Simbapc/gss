<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- 侧边栏 -->
        <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div class="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-gray-800 to-gray-900">
                <!-- Logo区域 -->
                <div class="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-900">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-2">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <span class="text-white font-bold text-lg">系统管理</span>
                    </div>
                </div>

                <!-- 导航菜单 -->
                <div class="flex-1 flex flex-col overflow-y-auto py-4">
                    <nav class="flex-1 px-4 space-y-2">
                        <router-link v-for="item in navigation" :key="item.name" :to="item.href" :class="[
                            item.current
                                ? 'bg-gray-700 text-white border-l-4 border-primary-500'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white border-l-4 border-transparent',
                            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200'
                        ]">
                            <component :is="item.icon" :class="[
                                item.current ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300',
                                'flex-shrink-0 h-5 w-5 mr-3'
                            ]" aria-hidden="true" />
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
                    <button
                        class="lg:hidden -ml-2 mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <!-- 标题 -->
                    <div class="flex-1">
                        <h1 class="text-xl font-semibold text-gray-900">经管信息管理系毕业生在线选题系统 - 管理后台</h1>
                    </div>

                    <!-- 用户菜单 -->
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-medium">
                                    {{ authStore.user?.name?.charAt(0) || 'A' }}
                                </span>
                            </div>
                            <span class="text-gray-700 font-medium hidden sm:block">
                                欢迎您, {{ authStore.user?.name }}
                            </span>
                        </div>
                        <el-button type="primary" @click="authStore.logout()" class="btn-primary">
                            退出登录
                        </el-button>
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
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { User, Tickets, List } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const route = useRoute();

// 导航菜单配置
const navigation = computed(() => [
    {
        name: '用户管理',
        href: '/admin/users',
        icon: User,
        current: route.path === '/admin/users'
    },
    {
        name: '课题总览',
        href: '/admin/topics',
        icon: Tickets,
        current: route.path === '/admin/topics'
    },
    {
        name: '选题总览',
        href: '/admin/selections',
        icon: List,
        current: route.path === '/admin/selections'
    }
]);
</script>

<style scoped>
/* 可以添加一些自定义样式，如果需要的话 */
</style>
