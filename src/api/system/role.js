import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/admin/permission/group/index',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/admin/permission/group/detail?id=' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/admin/permission/group/create',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/admin/permission/group/update',
    method: 'post',
    data: data
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: '/admin/permission/group/delete?id=' + roleId,
    method: 'post'
  })
}

// 获取角色选择下拉
export function getRoleSelect() {
  return request({
    url: '/admin/permission/group/option',
    method: 'get'
  })
}

// 获取角色关联的菜单ID集合
export function getRoleMenuIds(roleId) {
  return request({
    url: '/admin/permission/group/menuIds?id=' + roleId,
    method: 'get'
  })
}
