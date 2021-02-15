import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)

const routes = [
  // 根路径
  {
    path: '/',
    redirect: '/login'
  },
  // 登录组件
  {
    path: '/login',
    component: Login
  },
  // home组件
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

// 导航守卫控制访问权限
router.beforeEach((to, from, next) => {
  // 确认是登录路径
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  // token 为空
  if (!token) return next('/login')
  // 放行
  next()
})

export default router
