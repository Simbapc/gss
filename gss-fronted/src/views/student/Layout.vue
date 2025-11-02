<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 移动端布局 -->
        <div class="lg:hidden flex flex-col min-h-screen">
            <!-- 移动端顶部导航 -->
            <div class="bg-white shadow-sm border-b border-gray-200">
                <div class="px-4 py-3">
                    <div class="flex items-center justify-between">
                        <!-- 移动端菜单按钮 -->
                        <button 
                            @click="mobileMenuOpen = !mobileMenuOpen"
                            class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <!-- 移动端标题 -->
                        <div class="text-center flex-1">
                            <h1 class="text-lg font-bold text-gray-900">学生工作台</h1>
                        </div>
                        
                    <!-- 移动端用户菜单 -->
                    <div class="relative mobile-user-menu">
                        <button 
                            @click="mobileUserMenuOpen = !mobileUserMenuOpen"
                            class="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <div class="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-medium">
                                    {{ authStore.user?.name?.charAt(0) || 'U' }}
                                </span>
                            </div>
                        </button>
                        
                        <!-- 移动端用户下拉菜单 -->
                        <div v-if="mobileUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
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
                
                <!-- 移动端侧边菜单 -->
                <div v-if="mobileMenuOpen" class="bg-white border-t border-gray-200">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        <router-link 
                            to="/student/topic-list"
                            @click="mobileMenuOpen = false"
                            :class="[
                                'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                                activeMenu === '/student/topic-list' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            ]"
                        >
                            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            课题列表
                        </router-link>
                        <router-link 
                            to="/student/my-selection"
                            @click="mobileMenuOpen = false"
                            :class="[
                                'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                                activeMenu === '/student/my-selection' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            ]"
                        >
                            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            我的选题
                        </router-link>
                    </div>
                </div>
            </div>

            <!-- 移动端主要内容区域 -->
            <main class="flex-1 overflow-auto">
                <router-view />
            </main>
        </div>

        <!-- 桌面端布局 -->
        <div class="hidden lg:flex min-h-screen">
            <!-- 桌面端侧边栏 -->
            <div class="w-64 bg-white shadow-sm border-r border-gray-200">
                <div class="flex flex-col h-full">
                    <!-- 桌面端标题 -->
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h1 class="text-xl font-bold text-gray-900">学生工作台</h1>
                    </div>
                    
                    <!-- 桌面端导航菜单 -->
                    <nav class="flex-1 px-4 py-6 space-y-2">
                        <router-link 
                            to="/student/topic-list"
                            :class="[
                                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                                activeMenu === '/student/topic-list' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            ]"
                        >
                            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            课题列表
                        </router-link>
                        <router-link 
                            to="/student/my-selection"
                            :class="[
                                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                                activeMenu === '/student/my-selection' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            ]"
                        >
                            <svg class="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            我的选题
                        </router-link>
                    </nav>
                    
                    <!-- 桌面端用户信息 -->
                    <div class="px-4 py-4 border-t border-gray-200">
                        <div class="flex items-center space-x-3">
                            <div class="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-medium">
                                    {{ authStore.user?.name?.charAt(0) || 'U' }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user?.name }}</p>
                                <p class="text-xs text-gray-500 truncate">学生</p>
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
import { Document as ElIconDocument, Collection as ElIconCollection, ArrowDown } from '@element-plus/icons-vue';
import { Tickets as ElIconTickets, DocumentChecked as ElIconDocumentChecked } from '@element-plus/icons-vue';
import ProfileEditor from '../../components/ProfileEditor.vue'; // 引入组件

const authStore = useAuthStore();
const route = useRoute();

// 响应式状态
const mobileMenuOpen = ref(false);
const mobileUserMenuOpen = ref(false);
const desktopUserMenuOpen = ref(false);

const activeMenu = computed(() => route.path);

const profileEditorRef = ref(null); // 创建 ref

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
