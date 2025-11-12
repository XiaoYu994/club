
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import notificationPlugin from './utils/notification.js'

Vue.config.productionTip = false

// 注册全局通知插件
Vue.use(notificationPlugin)

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
import api from './api/api.js'
import notificationPlugin from './utils/notification.js'

export function createApp() {
  const app = createSSRApp(App)
  app.config.globalProperties.$api = api;

  // 注册全局通知插件
  app.use(notificationPlugin)

  return {
    app
  }
}
// #endif