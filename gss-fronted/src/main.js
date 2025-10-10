// src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 引入 createPinia

import App from './App.vue'
import router from './router' // 引入 router
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 1. 创建 Vue 应用实例
const app = createApp(App)

// 2. 创建并使用 Pinia 实例
// 这会向应用提供一个全局的 pinia store
app.use(createPinia())

// 3. 使用路由
// 放在 use(createPinia()) 之后，确保路由守卫能访问到 store
app.use(router)

// 4. 使用 Element Plus
app.use(ElementPlus)

// 5. 挂载应用
app.mount('#app')