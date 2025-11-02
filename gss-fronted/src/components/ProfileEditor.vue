<template>
    <el-dialog v-model="dialogVisible" title="个人中心" :class="['profile-dialog']" @closed="resetForm">
        <el-form :model="form" :rules="rules" ref="formRef" :label-width="labelWidth">
            <el-form-item label="用户名">
                <el-input :value="authStore.user?.username" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="角色">
                <el-input :value="roleText(authStore.user?.role)" disabled />
            </el-form-item>
            <el-form-item label="专业" v-if="authStore.user?.role === 'student'">
                <el-input :value="authStore.user?.major || '未设置'" disabled />
            </el-form-item>
            <el-form-item label="新密码" prop="password">
                <el-input v-model="form.password" type="password" placeholder="不修改则留空" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false" class="btn-cancel">取消</el-button>
                <el-button type="primary" @click="handleSubmit" class="btn-submit">确认修改</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { updateProfile } from '../api/modules/user';
import { ElMessage } from 'element-plus';

// 响应式标签宽度
const labelWidth = computed(() => {
  return window.innerWidth < 768 ? '70px' : '80px';
});

const authStore = useAuthStore();
const dialogVisible = ref(false);
const formRef = ref(null);

const form = reactive({
    name: '',
    password: '',
});

const rules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    password: [{ min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
};

// 角色文本转换
const roleText = (role) => {
    const roleMap = {
        student: '学生',
        teacher: '教师',
        admin: '管理员'
    };
    return roleMap[role] || '未知';
};

// 定义一个 open 方法，供父组件调用
const open = () => {
    form.name = authStore.user?.name || '';
    form.password = '';
    dialogVisible.value = true;
};

// 暴露 open 方法
defineExpose({ open });

const resetForm = () => {
    formRef.value?.resetFields();
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const payload = {
                    name: form.name
                };
                // 只有当用户输入了新密码时，才将其加入到请求体中
                if (form.password) {
                    payload.password = form.password;
                }

                const res = await updateProfile(payload);

                // 使用 Pinia action 更新用户信息
                authStore.updateUser(res.data.user);

                ElMessage.success('个人信息更新成功！');
                dialogVisible.value = false;
            } catch (error) {
                console.error("更新失败:", error);
                ElMessage.error(error.response?.data?.message || '更新失败');
            }
        }
    });
};
</script>

<style scoped>
.profile-dialog {
  /* 桌面端默认样式 */
}

.profile-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.profile-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e4e7ed;
}

.profile-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.profile-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.profile-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}

.profile-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.profile-dialog :deep(.el-input) {
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  min-width: 80px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .profile-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% auto !important;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .profile-dialog :deep(.el-dialog__header) {
    padding: 16px 16px 8px;
  }
  
  .profile-dialog :deep(.el-dialog__title) {
    font-size: 16px;
  }
  
  .profile-dialog :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  .profile-dialog :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .profile-dialog :deep(.el-form-item__label) {
    font-size: 14px;
    padding-right: 8px;
  }
  
  .profile-dialog :deep(.el-input) {
    font-size: 14px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-cancel,
  .btn-submit {
    width: 100%;
    margin: 0 !important;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .profile-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 2% auto !important;
  }
  
  .profile-dialog :deep(.el-dialog__header) {
    padding: 12px 12px 6px;
  }
  
  .profile-dialog :deep(.el-dialog__body) {
    padding: 12px;
  }
  
  .profile-dialog :deep(.el-form-item) {
    margin-bottom: 12px;
  }
  
  .profile-dialog :deep(.el-form-item__label) {
    font-size: 13px;
  }
  
  .profile-dialog :deep(.el-input) {
    font-size: 13px;
  }
}

/* 极小屏幕优化 */
@media (max-width: 360px) {
  .profile-dialog :deep(.el-dialog) {
    width: 98% !important;
    margin: 1% auto !important;
  }
  
  .profile-dialog :deep(.el-dialog__header) {
    padding: 10px 10px 5px;
  }
  
  .profile-dialog :deep(.el-dialog__body) {
    padding: 10px;
  }
  
  .profile-dialog :deep(.el-form-item) {
    margin-bottom: 10px;
  }
}
</style>
