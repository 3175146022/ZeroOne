import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/dev-api', // 使用代理地址
  timeout: 10000 // 请求超时时间
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['X-Access-Token'] = token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 这里可以根据后端返回的状态码进行统一处理
    // 假设 200 是成功，或者根据实际情况调整
    if (res.code === 200) {
      return res
    } else {
      // 如果是二进制数据（如图片流），直接返回
      if (response.config.responseType === 'blob') {
        return response
      }
      
      const errorMessage = res.message || res.msg || 'Error'
      ElMessage({
        message: errorMessage,
        type: 'error',
        duration: 5 * 1000
      })

      // 401: Token 过期或未登录
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout().then(() => {
          router.push('/login')
        })
      }
      return Promise.reject(new Error(errorMessage))
    }
  },
  error => {
    console.log('err' + error) // for debug
    
    // 处理 HTTP 状态码为 401 的情况
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout().then(() => {
        router.push('/login')
      })
    }

    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
