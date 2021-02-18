import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/operation/manager/role/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取当前角色授权信息
 */
export function fetchPerList(query) {
  return request({
    url: '/operation/manager/role/permission',
    method: 'get',
    params: query
  })
}

/**
 * 更改当前角色的授权信息
 */
export function updatePermission(param) {
  return request({
    url: '/operation/manager/role/save-permission',
    method: 'post',
    data: param
  })
}

/* add role */
export function addRoleRequest(param) {
  return request({
    url: '/operation/manager/role/add',
    method: 'post',
    data: param
  })
}

/* edit role */
export function editRoleRequest(param) {
  return request({
    url: '/operation/manager/role/edit',
    method: 'post',
    data: param
  })
}

/* delete role */
export function delRoleRequest(param) {
  return request({
    url: '/operation/manager/role/delete',
    method: 'post',
    data: param
  })
}

/* save role status*/
export function saveRoleStatusRequest(param) {
  return request({
    url: '/operation/manager/role/enable',
    method: 'post',
    data: param
  })
}
