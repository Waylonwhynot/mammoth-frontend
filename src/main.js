import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/main.css'
import axios from 'axios'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('token')
  return config
})

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    console.log('response: ', response)
    if (response.config.url === 'login/') {
      return response
    }
    console.log(response)
    if (response.data.code && response.data.code < 100) {
      router.push('/login')
    } else {
      return response
    }
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

// 为了baseURL应该改为指向我们后台服务器 http://localhost:8080  /api/v1/login/
axios.defaults.baseURL = '/api/v1/'
Vue.prototype.$http = axios // xhr ajax

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
