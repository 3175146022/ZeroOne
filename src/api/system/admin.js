import request from '@/utils/request'

// 查询管理员列表
export function listAdmin(query) {
  return request({
    url: '/admin/permission/admin/index',
    method: 'get',
    params: query
  })
}

// 查询管理员详细
export function getAdmin(id) {
  return request({
    url: '/admin/permission/admin/detail?id=' + id,
    method: 'get'
  })
}

// 新增管理员
export function addAdmin(data) {
  return request({
    url: '/admin/permission/admin/create',
    method: 'post',
    data: data
  })
}

// 修改管理员
export function updateAdmin(data) {
  return request({
    url: '/admin/permission/admin/update',
    method: 'post',
    data: data
  })
}

// 删除管理员
export function delAdmin(id) {
  return request({
    url: '/admin/permission/admin/delete?id=' + id,
    method: 'post'
  })
}

// 重置密码
export function resetAdminPwd(data) {
  return request({
    url: '/admin/permission/admin/password',
    method: 'post',
    data: data
  })
}
