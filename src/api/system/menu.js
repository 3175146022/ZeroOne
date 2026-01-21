import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/admin/permission/rule/index',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: '/admin/permission/rule/detail?id=' + menuId,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/admin/permission/rule/create',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/admin/permission/rule/update',
    method: 'post',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/admin/permission/rule/delete?id=' + menuId,
    method: 'post'
  })
}

// 获取菜单下拉树列表
export function getMenuSelect() {
  return request({
    url: '/admin/permission/rule/option',
    method: 'get'
  })
}
