import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 全局样式
import './assets/css/global.css'
// 字体图标样式
import './assets/fonts/iconfont.css'

// 挂载请求
import axios from 'axios'
// 基本路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂载实例
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
