import request from '@/utils/request'

/**
 * 粉丝管理列表数
 */
export function fetchFasList(data) {
  return request({
    url: '/operation/follower/follower/get-account-list',
    method: 'get',
    params: data
  })
}

/**
 * 获得站点账号下我的粉丝库相关信息(未关注)
 *
 */
export function fetchStorageNoAttention(query) {
  return request({
    url: '/operation/follower/follower/no-attention-list',
    method: 'get',
    params: query
  })
}

/**
 * 获得站点账号下我的粉丝库相关信息(已关注已取消)
 *
 */
export function fetchStorageAttention(query) {
  return request({
    url: '/operation/follower/follower/follow-lib-list',
    method: 'get',
    params: query
  })
}

/**
 *  获取店铺粉丝相关信息
 */
export function fetchStoreFans(data) {
  data.not_show_message = true
  return request({
    url: '/operation/follower/follower/fans-list',
    method: 'get',
    params: data
  })
}

/**
 *  加入粉丝库
 */
export function fetchAddFanStorage(data) {
  return request({
    url: '/operation/follower/follower/add-follow-lib',
    method: 'post',
    data: data
  })
}

/**
 *  添加关注/取消关注
 */
export function fetchAddOrCancelAttention(data) {
  return request({
    url: '/operation/follower/follower/follow-fans',
    method: 'post',
    data: data
  })
}

/**
 *  删除粉丝
 */
export function fetchDeleteFans(data) {
  return request({
    url: '/operation/follower/follower/delete-fans',
    method: 'post',
    data: data
  })
}

/**
 * 粉丝收集列表
 */
export function fetchCollectorList(query) {
  return request({
    url: '/operation/collection/collection-fans/task-list',
    method: 'get',
    params: query
  })
}

/**
 * 收集粉丝数据
 */
export function fetchCollectorFans(data) {
  return request({
    url: '/operation/collection/collection-fans/add-collection-task',
    method: 'post',
    data: data
  })
}

/**
 * 立即采集
 */
export function fetchCollectorFansAgain(data) {
  return request({
    url: '/operation/collection/collection-fans/again-collection',
    method: 'post',
    data: data
  })
}
/**
 * 产品线
 */
export function fetchProductLine() {
  return request({
    url: '/operation/collection/collection-fans/get-item-line',
    method: 'get'
  })
}
