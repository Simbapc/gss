<template>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <!-- 背景装饰元素 -->
        <div class="absolute top-0 left-0 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div class="absolute top-0 right-0 w-72 h-72 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-20 w-72 h-72 bg-warning-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div class="relative w-full max-w-md">
            <!-- 登录卡片 -->
            <div class="card backdrop-blur-sm bg-white/80 border border-white/20 shadow-medium">
                <div class="card-header text-center">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l9 5m-9 5l-9-5"></path>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-800">选题系统</h1>
                    </div>
                    <p class="text-sm text-gray-600">经管信息管理系毕业生在线选题系统</p>
                </div>
                
                <div class="card-body">
                    <el-form :model="loginForm" @submit.prevent="handleLogin" class="space-y-6">
                        <div>
                            <label class="form-label">账号</label>
                            <el-input 
                                v-model="loginForm.username" 
                                placeholder="请输入学号/工号"
                                size="large"
                                class="form-input"
                            >
                                <template #prefix>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </template>
                            </el-input>
                        </div>
                        
                        <div>
                            <label class="form-label">密码</label>
                            <el-input 
                                type="password" 
                                v-model="loginForm.password" 
                                placeholder="请输入密码" 
                                show-password
                                size="large"
                                class="form-input"
                            >
                                <template #prefix>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </template>
                            </el-input>
                        </div>
                        
                        <el-button 
                            type="primary" 
                            native-type="submit" 
                            class="w-full btn-primary py-3 text-base font-medium"
                            :loading="authStore.loading"
                        >
                            登录
                        </el-button>
                    </el-form>
                </div>
            </div>
            
            <!-- 底部信息 -->
            <div class="text-center mt-6">
                <p class="text-sm text-gray-500">
                    请使用您的学号/工号和密码登录系统
                </p>
            </div>
        </div>
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
/* 背景动画 */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
