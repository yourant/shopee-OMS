import request from '@/utils/request'

/**
 * 用户列表
 * @param query
 */
export function fetchList(query) {
  return request({
    url: '/operation/manager/user/list',
    method: 'get',
    params: query
  })
}

/**
 * 禁/启用
 * @param param
 */
export function modifyStatusRequest(param) {
  return request({
    url: '/operation/manager/user/enable',
    method: 'post',
    data: param
  })
}

/**
 * 删除用户
 * @param param
 */
export function delUserRequest(param) {
  return request({
    url: '/operation/manager/user/delete',
    method: 'post',
    data: param
  })
}

/**
 * 添加查询用户
 * @param param
 */
export function searchUserRequest(param) {
  return request({
    url: '/operation/manager/user/search',
    method: 'get',
    params: { key: param }
  })
}

export function searchUserInfoRequest(param) {
  return request({
    url: '/operation/manager/user/search-info',
    method: 'get',
    params: { username: param }
  })
}

export function addUserRequest(param) {
  return request({
    url: '/operation/manager/user/add',
    method: 'post',
    data: param
  })
}

export function operableAccount(data) {
  return request({
    url: '/operation/account/account/operable-account',
    method: 'get',
    params: data
  })
}

export function editUserAccount(data) {
  return request({
    url: '/operation/manager/user/edit-user-account',
    method: 'post',
    data: data
  })
}

/* get roles list */
export function fetchUserRolesList() {
  return request({
    url: '/operation/manager/user/edit-role',
    method: 'get'
  })
}

/* save roles change list */
export function saveUserRolesList(param) {
  return request({
    url: '/operation/manager/user/save-role',
    method: 'post',
    data: param
  })
}
