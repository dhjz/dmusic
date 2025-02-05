import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'

// 引入UI库
// import uviewPlus from 'uview-plus'

import { initRequest } from './utils/request'

// 引入校验方法
import './utils/validate'

export function createApp() {
  const app = createSSRApp(App)

  // 引入请求封装
  initRequest(app)

  // 使用UI库
  // app.use(uviewPlus)

  // 使用状态管理
  app.use(Pinia.createPinia())

  return { app, Pinia }
}
