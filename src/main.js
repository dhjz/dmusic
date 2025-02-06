import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'

// 引入UI库
import uviewPlus from 'uview-plus'

import { initRequest } from './utils/request'
import CurrPlayList from '@/components/CurrPlayList/index';
import FloatTool from '@/components/FloatTool//index';

import './static/styles/common.scss';

// 引入校验方法
// import './utils/validate'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用UI库
  app.use(uviewPlus)

  // 引入请求封装
  initRequest(app)

  app.component('CurrPlayList', CurrPlayList)
  app.component('FloatTool', FloatTool)


  // 使用状态管理
  app.use(Pinia.createPinia())

  return { app, Pinia }
}
