<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
console.log("--- App.vue script setup 执行 ---");
onMounted(() => {
  console.log("--- App.vue 已挂载 (mounted) ---");
});
</script>
<style>
/* 可以在此添加全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>