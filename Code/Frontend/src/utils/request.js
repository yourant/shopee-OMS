import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import qs from 'qs'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 600000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const { data } = config
    config.headers['Content-Type'] = data && data.isJson ? 'application/json' : 'application/x-www-form-urlencoded'
    if (config.data && config.data.not_show_message) {
      config['show_message'] = false
    } else {
      config['show_message'] = true
    }
    if (config.method === 'post') { // post请求时，处理数据
      if (!(data && data.isJson)) {
        config.data = qs.stringify(config.data)
      }
    }
    if (store.getters.token) {
      // let each request carry token
      // ['Authorization'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // 平台接口504限制
    const errorTipUrl = [
      'operation/shopee-chat/conversations',
      'operation/shopee-chat/message/list',
      'operation/shopee-chat/order/meta',
      'operation/shopee-chat/order/cur-list'
    ]
    if ((res.code && res.code !== 200) || res.code === 0) {
      // 2001 token失效或者过期
      if (res.code === 20001 || (res.code === 30004 && response.config.url.includes('/operation/chat-statistics/down-load-excel'))) {
        MessageBox.confirm(res.message, '提示', {
          type: 'warning',
          showCancelButton: false,
          confirmButtonText: '确定'
        }).finally(() => {
          store.dispatch('user/FedLogOut').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        })
      } else if (errorTipUrl.some(v => response.config.url.includes(v)) && res.code === 1002) {
        if (!store.getters.hasErrorTip) {
          Message({
            message: '平台接口受限，请刷新重试或切换账号',
            type: 'warning',
            duration: 5 * 1000
          })
          store.commit('chat/SET_ERROR_TIP',true)
        }
        return Promise.reject(res)
      } else {
        if (res.message && response.config.show_message || res.code === 1001 || res.code === 1000) {
          Message({
            message: res.message,
            type: 'error',
            duration: 5 * 1000
          })
        }
      }
      return Promise.reject(res.message)
    } else {
      if (response.config.method === 'post') {
        // 屏蔽message
        if (response.config.show_message) {
          Message({
            message: response.data.message,
            type: 'success',
            duration: 5 * 1000
          })
        }
      }
      return response.data
    }
  },
  error => {
    console.log('err' + error)
    if (error.message && error.message !== 'Request failed with status code 504') {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
