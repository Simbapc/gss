<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 移动端布局 -->
        <div class="lg:hidden flex flex-col min-h-screen">
            <!-- 移动端顶部导航 -->
            <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div class="px-4 py-3">
                    <div class="flex items-center justify-between">
                        <!-- 移动端菜单按钮 -->
                        <button 
                            @click="mobileMenuOpen = !mobileMenuOpen"
                            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <!-- 移动端标题 -->
                        <div class="text-center flex-1">
                            <h1 class="text-lg font-bold text-gray-900 truncate">教师工作台</h1>
                            <p class="text-xs text-gray-500 mt-1">欢迎您，{{ authStore.user?.name }}</p>
                        </div>
                        
                        <!-- 移动端用户菜单 -->
                        <div class="relative mobile-user-menu">
                            <button 
                                @click="mobileUserMenuOpen = !mobileUserMenuOpen"
                                class="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                            >
                                <div class="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                    <span class="text-white text-sm font-medium">
                                        {{ authStore.user?.name?.charAt(0) || 'T' }}
                                    </span>
                                </div>
                            </button>
                            
                            <!-- 移动端用户下拉菜单 -->
                            <div v-if="mobileUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in-0 zoom-in-95">
                                <div class="py-1">
                                    <button 
                                        @click="openProfile"
                                        class="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                                    >
                                        <svg class="h-4 w-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        个人中心
                                    </button>
                                    <button 
                                        @click="handleLogout"
                                        class="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 border-t border-gray-100"
                                    >
                                        <svg class="h-4 w-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        退出登录
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 移动端侧边菜单 -->
                <div v-if="mobileMenuOpen" class="bg-white border-t border-gray-200 animate-in slide-in-from-top-1 duration-200">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        <router-link 
                            v-for="item in navigation"
                            :key="item.name"
                            :to="item.href"
                            @click="mobileMenuOpen = false"
                            :class="[
                                'flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 transform hover:scale-105',
                                item.current 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            ]"
                        >
                            <component :is="item.icon" :class="[
                                'h-5 w-5 mr-3 transition-colors duration-200',
                                item.current ? 'text-blue-600' : 'text-gray-400'
                            ]" />
                            {{ item.name }}
                        </router-link>
                    </div>
                </div>
            </div>

            <!-- 移动端主要内容区域 -->
            <main class="flex-1 overflow-auto bg-gray-50">
                <div class="p-4">
                    <router-view />
                </div>
            </main>

            <!-- 移动端底部导航 -->
            <div class="bg-white border-t border-gray-200 sticky bottom-0 z-40">
                <div class="flex justify-around items-center py-2">
                    <router-link
                        v-for="item in navigation"
                        :key="item.name"
                        :to="item.href"
                        :class="[
                            'flex flex-col items-center p-2 rounded-lg transition-all duration-200 flex-1 mx-1',
                            item.current 
                                ? 'text-blue-600 bg-blue-50' 
                                : 'text-gray-500 hover:text-blue-600'
                        ]"
                    >
                        <component :is="item.icon" :class="[
                            'h-5 w-5 mb-1 transition-colors duration-200',
                            item.current ? 'text-blue-600' : 'text-gray-400'
                        ]" />
                        <span class="text-xs font-medium">{{ item.name }}</span>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- 桌面端布局 -->
        <div class="hidden lg:flex min-h-screen">
            <!-- 桌面端侧边栏 -->
            <div class="w-64 bg-white shadow-sm border-r border-gray-200">
                <div class="flex flex-col h-full">
                    <!-- 桌面端标题 -->
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h1 class="text-xl font-bold text-gray-900">教师工作台</h1>
                    </div>
                    
                    <!-- 桌面端导航菜单 -->
                    <nav class="flex-1 px-4 py-6 space-y-2">
                        <router-link 
                            v-for="item in navigation"
                            :key="item.name"
                            :to="item.href"
                            :class="[
                                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                                item.current 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            ]"
                        >
                            <component :is="item.icon" class="h-5 w-5 mr-3" />
                            {{ item.name }}
                        </router-link>
                    </nav>
                    
                    <!-- 桌面端用户信息 -->
                    <div class="px-4 py-4 border-t border-gray-200">
                        <div class="flex items-center space-x-3">
                            <div class="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-medium">
                                    {{ authStore.user?.name?.charAt(0) || 'T' }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user?.name }}</p>
                                <p class="text-xs text-gray-500 truncate">教师</p>
                            </div>
                            <div class="relative desktop-user-menu">
                                <button 
                                    @click="desktopUserMenuOpen = !desktopUserMenuOpen"
                                    class="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </button>
                                
                                <!-- 桌面端用户下拉菜单 -->
                                <div v-if="desktopUserMenuOpen" class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div class="py-1">
                                        <button 
                                            @click="openProfile"
                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            个人中心
                                        </button>
                                        <button 
                                            @click="handleLogout"
                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                                        >
                                            退出登录
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 桌面端主要内容区域 -->
            <div class="flex-1 flex flex-col">
                <!-- 主要内容 -->
                <main class="flex-1 overflow-auto">
                    <router-view />
                </main>
            </div>
        </div>
    </div>
    <ProfileEditor ref="profileEditorRef" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '../../store/auth';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Document as ElIconDocument, Finished as ElIconFinished, Operation as ElIconOperation } from '@element-plus/icons-vue';
import ProfileEditor from '../../components/ProfileEditor.vue';

const authStore = useAuthStore();
const route = useRoute();

// 响应式状态
const mobileMenuOpen = ref(false);
const mobileUserMenuOpen = ref(false);
const desktopUserMenuOpen = ref(false);

const activeMenu = computed(() => route.path);

const profileEditorRef = ref(null); // 创建 ref

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

// 调用子组件的 open 方法
const openProfile = () => {
    profileEditorRef.value?.open();
    // 关闭所有菜单
    mobileUserMenuOpen.value = false;
    desktopUserMenuOpen.value = false;
};

const handleLogout = () => {
    authStore.logout();
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
    // 关闭移动端用户菜单
    if (mobileUserMenuOpen.value && !event.target.closest('.mobile-user-menu')) {
        mobileUserMenuOpen.value = false;
    }
    
    // 关闭桌面端用户菜单
    if (desktopUserMenuOpen.value && !event.target.closest('.desktop-user-menu')) {
        desktopUserMenuOpen.value = false;
    }
};

// 监听路由变化关闭移动端菜单
const unwatch = watch(() => route.path, () => {
    mobileMenuOpen.value = false;
});

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 可以添加一些自定义样式，如果需要的话 */
</style>
