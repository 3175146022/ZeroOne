import request from '@/utils/request'

// 查询操作日志列表
export function listOplog(query) {
  return request({
    url: '/admin/permission/oplog/index',
    method: 'get',
    params: query
  })
}

// 查询操作日志详细
export function getOplog(id) {
  return request({
    url: '/admin/permission/oplog/detail?id=' + id,
    method: 'get'
  })
}
