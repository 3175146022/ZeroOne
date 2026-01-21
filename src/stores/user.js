import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({
    username: 'admin',
    avatar: '/avtar.jpeg',
    roles: ['admin']
  })
  const menus = ref([])
  const isRoutesLoaded = ref(false)

  function login(username, password, captcha, captcha_key) {
    return new Promise((resolve, reject) => {
      // 引入 login API
      import('../api/login').then(({ login: loginApi }) => {
        loginApi(username, password, captcha, captcha_key).then(res => {
          if (res.code === 200) {
            token.value = res.data.access_token
            localStorage.setItem('token', token.value)
            // 登录成功后获取用户信息
            getInfo().then(() => {
              resolve()
            }).catch(error => {
              reject(error)
            })
          } else {
            reject(new Error(res.message || '登录失败'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    })
  }

  function getInfo() {
    return new Promise((resolve, reject) => {
      import('../api/login').then(({ getUserInfo }) => {
        getUserInfo().then(res => {
          if (res.code === 200) {
            const user = res.data
            userInfo.value = {
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar || '/avtar.jpeg',
              roles: user.isSuperAdmin ? ['admin'] : ['common'],
              permissions: user.permissions
            }
            resolve(res)
          } else {
            reject(new Error(res.message))
          }
        }).catch(error => {
          reject(error)
        })
      })
    })
  }

  function getRouters() {
    return new Promise((resolve, reject) => {
      import('../api/login').then(({ getRouters }) => {
        getRouters().then(res => {
          if (res.code === 200) {
            menus.value = res.data
            isRoutesLoaded.value = true
            resolve(res.data)
          } else {
            reject(new Error(res.message))
          }
        }).catch(error => {
          reject(error)
        })
      })
    })
  }

  function logout() {
    return new Promise((resolve, reject) => {
      import('../api/login').then(({ logout: logoutApi }) => {
        logoutApi().then(() => {
          token.value = ''
          userInfo.value = { ...userInfo.value, roles: [] }
          menus.value = []
          isRoutesLoaded.value = false
          localStorage.removeItem('token')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    })
  }

  return {
    token,
    userInfo,
    menus,
    isRoutesLoaded,
    login,
    getInfo,
    logout,
    getRouters
  }
})
