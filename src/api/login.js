import request from '../utils/request'

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/admin/login/captcha',
    method: 'get'
  })
}

// 登录方法
export function login(username, password, captcha, captcha_key) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: {
      username,
      password,
      captcha,
      captcha_key
    }
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/admin/current_user/info',
    method: 'get'
  })
}

// 获取用户权限路由
export function getRouters() {
  return request({
    url: '/admin/current_user/permissions',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/admin/current_user/logout',
    method: 'post'
  })
}

