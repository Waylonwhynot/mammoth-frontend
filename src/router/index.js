import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/Users'
import Perm from '../components/user/Perms'
import Role from '../components/user/Roles'
import CiType from '../components/cmdb/CiTypes'
import Ci from '../components/cmdb/Cis'
import Org from '../components/jumpserver/Orgs'
// 测试插槽用
// import T1 from '../components/T1'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/users/perms', component: Perm },
      { path: '/users/roles', component: Role },
      { path: '/cmdb/citypes', component: CiType },
      { path: '/cmdb/cis', component: Ci },
      { path: '/jumpserver/orgs', component: Org }
      // { path: '/t1', component: T1 }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    // 更加复杂的处理是 去后台判断token
    // /home
    const token = window.localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
