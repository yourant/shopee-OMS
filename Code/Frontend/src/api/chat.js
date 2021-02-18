import request from '@/utils/request'
// import requestThird from '@/utils/request-third'

/* 会话列表 */
export function apiFetchConversations(data) {
  return request({
    url: '/operation/shopee-chat/conversations',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 消息列表 */
export function apiFetchmessage(data) {
  return request({
    url: '/operation/shopee-chat/message/list',
    method: 'post',
    data
  })
}

/* 删除会话 */
export function deleteConversations(data) {
  return request({
    url: '/operation/shopee-chat/conversations/delete',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 消息回复 */
export function apiSendMessage(data) {
  return request({
    url: '/operation/shopee-chat/message/send',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 读取消息 */
export function apiReadMessage(data) {
  return request({
    url: '/operation/shopee-chat/message/read',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 获取当前用户下站点账户列表*/
export function fetchAccountList(params) {
  return request({
    url: '/operation/account/account/al-ready-account',
    method: 'get',
    params
  })
}

/* 会话搜索*/
export function apiSearchAccountList(data) {
  return request({
    url: '/operation/shopee-chat/conversations/search',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/* 获取当前账户基础信息 */
export function fetchAccountInfo(data) {
  return request({
    url: '/operation/account/account/detail',
    method: 'post',
    data
  })
}

/* 获取通知消息 */
export function apiGetNoticeList(params) {
  return request({
    url: '/operation/shop-news/shop-news/list',
    method: 'get',
    params
  })
}

/* 定时请求是否有未处理通知消息 */
export function apiGetIsNotice(params) {
  return request({
    url: '/operation/shop-news/shop-news/get-notice-status',
    method: 'get',
    params
  })
}

/* 修改通知消息状态 */
export function apiSetStatus(data) {
  return request({
    url: '/operation/shop-news/shop-news/set-status',
    method: 'post',
    data
  })
}

/* 获取产品列表 */
export function apiGetProductList(data, Cookie) {
  return request({
    header: {
      Cookie
    },
    url: '/operation/shopee-chat/product/list',
    method: 'post',
    data
  })
}

/* 获取产品详情 */
export function apiGetProductInfo(data) {
  return request({
    url: '/operation/shopee-chat/product/info',
    method: 'post',
    data
  })
}

/* 获取订单详情 */
export function apiGetOrderInfo(data) {
  return request({
    url: '/operation/shopee-chat/order/cur-info',
    method: 'post',
    data
  })
}

/**
 * 待付款列表
 */
export function fetchNoPayment(params) {
  return request({
    url: '/operation/chat/auto-tips/list',
    method: 'get',
    params
  })
}

/**
 * 待付款设置
 */
export function fetchNoPaymentSeting(data) {
  return request({
    url: '/operation/chat/auto-tips/set-tips',
    method: 'post',
    data
  })
}

/**
 * 议价回复列表
 */
export function fetchBargain(params) {
  return request({
    url: '/operation/chat/discuss-price/list',
    method: 'get',
    params
  })
}

/**
 * 议价回复设置
 */
export function fetchBargainSeting(data) {
  return request({
    url: '/operation/chat/discuss-price/set-discuss-price',
    method: 'post',
    data
  })
}

/**
 * 议价详情
 */
export function apiBargainInfo(data) {
  return request({
    url: '/operation/shopee-chat/offer',
    method: 'post',
    data
  })
}

/**
 * 操作平台议价
 */
export function apiSetBargain(data) {
  return request({
    url: '/operation/chat/discuss-price/operation-discuss-price',
    method: 'post',
    data
  })
}

/**
 * 自动回复列表
 */
export function fetchReply(params) {
  return request({
    url: '/operation/auto-reply/auto-reply-template/list',
    method: 'get',
    params
  })
}

/**
 * 编辑自动回复模板
 */
export function apiReplyEdit(data) {
  return request({
    url: '/operation/auto-reply/auto-reply-template/set',
    method: 'post',
    data
  })
}

/**
 * 删除自动回复模板
 */
export function apiReplyDel(data) {
  return request({
    url: '/operation/auto-reply/auto-reply-template/del',
    method: 'post',
    data
  })
}

/**
 * 新增自动回复模板
 */
export function apiReplyAdd(data) {
  return request({
    url: '/operation/auto-reply/auto-reply-template/add',
    method: 'post',
    data
  })
}

/**
 * 自动回复设置列表
 */
export function apiReplySetList(params) {
  return request({
    url: '/operation/auto-reply/auto-reply-set/list',
    method: 'get',
    params
  })
}

/**
 * 自动回复设置编辑
 */
export function apiReplySetEdit(data) {
  return request({
    url: '/operation/auto-reply/auto-reply-set/set',
    method: 'post',
    data
  })
}

/**
 * 语言翻译
 */
export function apiTranslateText(data) {
  return request({
    url: '/operation/shopee-chat/message/translate',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧订单列表
 */
export function apiGetOrderList(data) {
  return request({
    url: '/operation/shopee-chat/order/cur-list',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧买家订单统计
 */
export function apiGetBuyerCount(data) {
  return request({
    url: '/operation/shopee-chat/shop/statistics',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧接受/拒绝  买家申请的取消订单
 */
export function apiSetCancelOrder(data) {
  return request({
    url: '/operation/shopee-chat/order/cancel',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 消息右侧买家信息
 */
export function apiGetBuyerInfo(data) {
  return request({
    url: '/operation/shopee-chat/userinfo',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 物流信息
 */
export function apiGetLogistics(data) {
  return request({
    url: '/operation/shopee-chat/order/logistics',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 订单状态查询
 */
export function apiGetOrderMeta(data) {
  return request({
    url: '/operation/shopee-chat/order/meta',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 会话设置、取消星标
 */
export function apiSetPinned(data) {
  return request({
    url: '/operation/shopee-chat/message/pinned',
    method: 'post',
    data: Object.assign(data, { isJson: true, not_show_message: true })
  })
}

/**
 * 会话标记 未读消息
 */
export function apiSetUnread(data) {
  return request({
    url: '/operation/shopee-chat/message/mark',
    method: 'post',
    data: Object.assign(data, { isJson: true, not_show_message: true })
  })
}

// 获取搜索会话详情
export function getSearchDetail(data) {
  return request({
    url: 'operation/shopee-chat/conversations/redirection',
    method: 'post',
    data: Object.assign(data, { isJson: true, not_show_message: true })
  })
}

// 获取账号下星标信息
export function getStarInfo(data) {
  return request({
    url: 'operation/shopee-chat/message/get/pinned',
    method: 'post',
    data: Object.assign(data, { isJson: true, not_show_message: true })
  })
}

/**
 * 快捷回复列表
 */
export function getReplyList(id) {
  return request({
    url: `/operation/reply/fast-reply/list?account_id=${ id }`,
    method: 'get'
  })
}

/**
 * 快捷回复添加
 */
export function addFastReply(data) {
  return request({
    url: '/operation/reply/fast-reply/add',
    method: 'post',
    data
  })
}

/**
 * 快捷回复编辑
 */
export function updateFastReply(data) {
  return request({
    url: '/operation/reply/fast-reply/update',
    method: 'post',
    data
  })
}

/**
 * 快捷回复删除
 */
export function deleteFastReply(data) {
  return request({
    url: '/operation/reply/fast-reply/delete',
    method: 'post',
    data
  })
}

/**
 * 编辑订单备注
 */
export function editOrderNote(data) {
  return request({
    url: '/operation/shopee-chat/order/note',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * 卖家评论买家
 */
export function rateCustomComment(data) {
  return request({
    url: '/operation/shopee-chat/order/rate',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

/**
 * istore物流信息
 */
export function getIstoreOrder(data) {
  return request({
    url: '/operation/webservice/posts/server',
    method: 'post',
    data
  })
}

/**
 * 会话统计筛选条件
 */
export function statisticsConversationOptions() {
  return request({
    url: '/operation/select/conversation-record',
    method: 'get'
  })
}

/**
 * 会话统计导出列表
 */
export function exportConversationStatistics(data) {
  return request({
    url: '/operation/chat-statistics/export',
    method: 'post',
    data
  })
}

/**
 * 会话设置、封锁用户
 */
export function apiSetBlocked(data) {
  return request({
    url: '/operation/shopee-chat/conversations/block',
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 回复率和转化率列表
export function getPerformanceList(params) {
  return request({
    url: '/operation/schedule/store-performance-schedule/schedule-list',
    method: 'get',
    params
  })
}

// 回复率转化率详情
export function getPerformanceDetail(params) {
  return request({
    url: '/operation/schedule/store-performance-schedule/schedule-info-list',
    method: 'get',
    params
  })
}

// 获取账号
export function getAllAccount(params) {
  return request({
    url: '/operation/select/account',
    method: 'get',
    params
  })
}

// 新增转化率任务
export function addPerformanceTask(data) {
  return request({
    url: '/operation/schedule/store-performance-schedule/add-schedule',
    method: 'post',
    data
  })
}

// 获取大金额订单客户
export function getBigOrderCustom(data) {
  return request({
    url: '/operation/account/get-huge-order-buyer',
    method: 'post',
    data
  })
}
