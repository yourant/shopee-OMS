import request from '@/utils/request'

/**
 * 站点列表
 * @param query
 */
export function fetchPlanList(query) {
  return request({
    url: '/operation/site/site/list',
    method: 'get',
    params: query
  })
}

/**
 * 添加站点
 * @param query
 */
export function addSite(query) {
  return request({
    url: '/operation/site/site/add',
    method: 'post',
    data: query
  })
}

/**
 * 编辑站点
 * @param query
 */
export function editSite(query) {
  return request({
    url: '/operation/site/site/set',
    method: 'post',
    data: query
  })
}

/**
 * 删除站点
 * @param query
 */
export function delSiteRequest(query) {
  return request({
    url: '/operation/site/site/delete',
    method: 'post',
    data: query
  })
}
