// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 我们稍后会创建它
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')