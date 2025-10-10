<template>
  <div>
    <el-button type="primary" @click="openDialog('add')">新增课题</el-button>

    <el-table :data="topics" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="title" label="课题标题" />
      <el-table-column prop="description" label="课题描述" />
      <el-table-column prop="maxStudents" label="可选人数" width="100" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
          <el-popconfirm title="确定要删除这个课题吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="form" label-width="120px">
        <el-form-item label="课题标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="课题描述">
          <el-input type="textarea" v-model="form.description" />
        </el-form-item>
        <el-form-item label="可选人数">
          <el-input-number v-model="form.maxStudents" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { fetchMyTopics, createTopic, updateTopic, deleteTopic } from '../../api/modules/topic';
import { ElMessage } from 'element-plus';

const topics = ref([]);
const dialogVisible = ref(false);
const dialogMode = ref('add'); // 'add' or 'edit'
const dialogTitle = ref('新增课题');

const form = reactive({
  id: null,
  title: '',
  description: '',
  maxStudents: 1,
});

const getTopics = async () => {
  try {
    const res = await fetchMyTopics();
    topics.value = res.data;
  } catch (error) {
    console.error("获取课题列表失败", error);
  }
};

onMounted(getTopics);

const openDialog = (mode, topicData = null) => {
  dialogMode.value = mode;
  if (mode === 'add') {
    dialogTitle.value = '新增课题';
    Object.assign(form, { id: null, title: '', description: '', maxStudents: 1 });
  } else {
    dialogTitle.value = '编辑课题';
    Object.assign(form, topicData);
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (dialogMode.value === 'add') {
      await createTopic({ title: form.title, description: form.description, maxStudents: form.maxStudents });
      ElMessage.success('新增成功');
    } else {
      await updateTopic(form.id, { title: form.title, description: form.description, maxStudents: form.maxStudents });
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    await getTopics(); // 刷新列表
  } catch (error) {
     console.error("操作失败", error);
  }
};

const handleDelete = async (id) => {
    try {
        await deleteTopic(id);
        ElMessage.success('删除成功');
        await getTopics(); // 刷新列表
    } catch(error) {
        console.error("删除失败", error);
    }
};
</script>