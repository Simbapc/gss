<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 页面头部 -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div class="flex justify-between items-center py-3 sm:py-4">
                    <div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">我的选题</h1>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">查看和管理您的毕业设计选题</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
            <!-- 实用功能工具栏 -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div class="flex items-center space-x-4">
                        <div class="text-sm text-gray-600">
                            <span class="font-medium text-gray-900">选题状态:</span>
                            <span v-if="mySelection" :class="[
                                'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                mySelection.status === 'approved' ? 'bg-green-100 text-green-800' :
                                mySelection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            ]">
                                {{ statusText(mySelection.status) }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <!-- 刷新按钮 -->
                        <button 
                            @click="fetchMySelection(true)"
                            :disabled="refreshing"
                            :class="[
                                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                                refreshing 
                                    ? 'bg-blue-100 text-blue-500 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            ]"
                        >
                            <svg v-if="refreshing" class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {{ refreshing ? '刷新中...' : '刷新状态' }}
                        </button>
                        
                        <!-- 返回课题列表按钮 -->
                        <button 
                            @click="$router.push({ name: 'StudentTopicList' })"
                            class="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            返回课题列表
                        </button>
                    </div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="mt-3 text-sm text-gray-500">加载中...</p>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!mySelection" class="flex justify-center items-center py-12">
                <div class="text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">您当前还未选择任何课题</h3>
                    <p class="mt-1 text-sm text-gray-500">请前往课题列表选择您感兴趣的课题</p>
                    <div class="mt-6">
                        <el-button type="primary" @click="$router.push({ name: 'StudentTopicList' })">
                            前往课题列表
                        </el-button>
                    </div>
                </div>
            </div>

        <!-- 选题详情 -->
        <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- 卡片头部 -->
          <div class="bg-white px-4 sm:px-6 py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900">选题详情</h2>
              <div class="mt-2 sm:mt-0">
                <span :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  mySelection.status === 'approved' ? 'bg-green-100 text-green-800' :
                  mySelection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                ]">
                  {{ statusText(mySelection.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 选题信息 -->
          <div class="p-4 sm:p-6">
            <!-- 移动端卡片布局 -->
            <div class="lg:hidden space-y-4">
              <!-- 课题信息卡片 -->
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="space-y-3">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">课题信息</h3>
                    <div class="mt-2 space-y-2">
                      <div>
                        <label class="text-xs font-medium text-gray-500">课题名称</label>
                        <p class="text-sm text-gray-900 mt-1">{{ mySelection.topic.title }}</p>
                      </div>
                      <div>
                        <label class="text-xs font-medium text-gray-500">课题描述</label>
                        <p class="text-sm text-gray-900 mt-1">{{ mySelection.topic.description || '暂无描述' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 教师信息卡片 -->
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="space-y-3">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">指导教师</h3>
                    <div class="mt-2">
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                          <div class="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-medium">
                              {{ mySelection.topic.teacher.name.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ mySelection.topic.teacher.name }}</p>
                          <p class="text-xs text-gray-500">指导教师</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 桌面端网格布局 -->
            <div class="hidden lg:block grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 课题信息 -->
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">课题信息</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="space-y-3">
                      <div>
                        <label class="text-xs font-medium text-gray-500">课题名称</label>
                        <p class="text-sm text-gray-900 mt-1">{{ mySelection.topic.title }}</p>
                      </div>
                      <div>
                        <label class="text-xs font-medium text-gray-500">课题描述</label>
                        <p class="text-sm text-gray-900 mt-1">{{ mySelection.topic.description || '暂无描述' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 教师信息 -->
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">指导教师</h3>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span class="text-white text-sm font-medium">
                            {{ mySelection.topic.teacher.name.charAt(0) }}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ mySelection.topic.teacher.name }}</p>
                        <p class="text-xs text-gray-500">指导教师</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                    <!-- 操作区域 -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <!-- "待审核"状态下，显示撤销按钮 -->
                        <div v-if="mySelection.status === 'pending'" class="text-center">
                            <el-popconfirm 
                                title="确定要撤销当前选择吗？" 
                                @confirm="handleCancel"
                                confirm-button-text="确定撤销"
                                cancel-button-text="取消"
                            >
                                <template #reference>
                                    <el-button type="danger" size="large">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        撤销选题
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>

                        <!-- "已拒绝"状态下，显示提示和"重新选择"按钮 -->
                        <div v-if="mySelection.status === 'rejected'" class="space-y-4">
                            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div class="flex items-start">
                                    <svg class="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 class="text-sm font-medium text-red-800">您的选题申请未通过</h3>
                                        <p class="text-sm text-red-700 mt-1">请选择其他课题或联系指导教师了解详情</p>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center">
                                <el-button type="primary" size="large" @click="handleCancel">
                                    我知道了，重新选择
                                </el-button>
                            </div>
                        </div>

                        <!-- "已通过"状态下，显示成功提示 -->
                        <div v-if="mySelection.status === 'approved'" class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-start">
                                <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 class="text-sm font-medium text-green-800">恭喜！选题成功。</h3>
                                    <p class="text-sm text-green-700 mt-1">您的毕业设计选题已通过审核，请开始您的毕业设计工作</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMySelection, cancelSelection } from '../../api/modules/selection';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const mySelection = ref(null);
const loading = ref(true);
const refreshing = ref(false);
const router = useRouter();

const statusMap = {
    pending: { text: '待审核', type: 'warning' },
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'error' }, // type 改为 error
};
const statusText = (status) => statusMap[status]?.text || '未知';
const statusTagType = (status) => statusMap[status]?.type || 'info';

const fetchMySelection = async (isRefresh = false) => {
    if (isRefresh) {
        refreshing.value = true;
    } else {
        loading.value = true;
    }
    try {
        const res = await getMySelection();
        // 在getMySelection的后端实现中，我们让未选择时返回null，所以这里res.data可能为null
        mySelection.value = res.data;
        if (isRefresh) {
            ElMessage.success('状态已刷新');
        }
    } catch (error) {
        console.error("获取我的选题失败:", error);
        if (isRefresh) {
            ElMessage.error('刷新失败，请重试');
        }
    } finally {
        if (isRefresh) {
            refreshing.value = false;
        } else {
            loading.value = false;
        }
    }
};

onMounted(fetchMySelection);

// 该函数现在用于"撤销"和"清除已拒绝状态"
const handleCancel = async () => {
    try {
        await cancelSelection();
        ElMessage.success('操作成功，现在可以重新选择课题。');
        // 跳转回课题列表页，让学生可以重新选择，并传递刷新参数
        router.push({ 
            name: 'StudentTopicList',
            query: { refresh: 'true' }
        });
    } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error(error.response?.data?.message || '操作失败');
    }
};
</script>

<style scoped>
.card-header {
    font-size: 18px;
    font-weight: bold;
}
</style>
