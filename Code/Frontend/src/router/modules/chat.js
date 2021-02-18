/*
 * chat Router配置表
 */
import Layout from '@/layout'

const asyncRouterMapChat = {
  path: '/chat',
  component: Layout,
  redirect: '/chat/list',
  alwaysShow: true,
  name: 'chat',
  meta: {
    title: '聊聊',
    icon: 'wechat',
    permission: 'shopnews.view',
    breadcrumb: false
  },
  children: [
    {
      path: '/chat/list',
      component: () => import('@/views/chat/list'),
      name: 'chat.list',
      meta: { title: '聊聊管理', icon: 'message', permission: 'chat.view' }
    },
    {
      path: '/chat/notice',
      component: () => import('@/views/chat/notice'),
      name: 'chat.notice',
      hidden: true,
      meta: { title: '通知管理', icon: 'message1', permission: 'operation.shop-news.shop-news.list' }
    },
    {
      path: '/chat/no-payment',
      component: () => import('@/views/chat/nopayment'),
      name: 'chat.nopayment',
      meta: { title: '待付款提示', icon: 'nopayment', permission: 'operation.chat.auto-tips.list' }
    },
    {
      path: '/chat/bargain',
      component: () => import('@/views/chat/bargain.vue'),
      name: 'chat.bargain',
      meta: { title: '议价设置', icon: 'bargain', permission: 'operation.chat.discuss-price.list' }
    },
    {
      path: '/chat/statistics',
      component: () => import('@/views/chat/statistics.vue'),
      name: 'chat.statistics',
      meta: { title: '会话统计', icon: 'chart', permission: 'conversationStatistics.view' }
    },
    {
      path: 'chat/percent-conversion',
      component: () => import('@/views/chat/percentConversion'),
      name: 'chat.percentConversion',
      meta: { title: '店铺表现统计', icon: 'chart', permission: 'operation.schedule.store-performance-schedule.schedule-info-list' }
    }
  ]
}
export default asyncRouterMapChat
