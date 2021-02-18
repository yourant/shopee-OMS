/*
 * chat Router配置表
 */
import Layout from '@/layout'

const asyncRouterMapFans = {
  path: '/fans',
  component: Layout,
  redirect: '/fans/list',
  alwaysShow: true,
  name: 'fans',
  meta: {
    title: '粉丝',
    icon: 'people',
    permission: 'follower.view',
    breadcrumb: false
  },
  children: [
    {
      path: '/fans/list',
      component: () => import('@/views/fans/list'),
      name: 'fans.list',
      meta: { title: '粉丝统计', icon: 'supplier-features', permission: 'operation.follower.follower.get-account-list' }
    },
    {
      path: '/fans/collector',
      component: () => import('@/views/fans/collector'),
      name: 'fans.collector',
      meta: { title: '粉丝采集', icon: 'role', permission: 'operation.collection.collection-fans.task-list' }
    }

    // {
    //   path: '/fans/add',
    //   component: () => import('@/views/fans/add'),
    //   name: 'fans.add',
    //   meta: { title: '粉丝添加', icon: 'fans_follow', permission: 'operation.follower.follower.add' }
    // }
  ]
}
export default asyncRouterMapFans
