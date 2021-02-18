import request from '@/utils/request'

/**
 * 账户列表
 * @param query
 */
export function fetchPlanList(query) {
  return request({
    url: '/operation/account/account/list',
    method: 'get',
    params: query
  })
}

/**
 * 添加账户
 * @param query
 */
export function addAccount(query) {
  return request({
    url: '/operation/account/account/add',
    method: 'post',
    data: query
  })
}

/**
 * 编辑账户
 * @param query
 */
export function editAccount(query) {
  return request({
    url: '/operation/account/account/set',
    method: 'post',
    data: query
  })
}

/**
 * 删除账户
 * @param query
 */
export function delAccount(query) {
  return request({
    url: '/operation/account/account/delete',
    method: 'post',
    data: query
  })
}

/**
 * 启用/禁用 账户
 * @param query
 */
export function apiUpdateAccountStatus(data) {
  return request({
    url: '/operation/account/account/active',
    method: 'post',
    data
  })
}

// 账号置顶
export function topOfAccount(data) {
  return request({
    url: '/operation/account/account/account-stick',
    method: 'post',
    data
  })
}
