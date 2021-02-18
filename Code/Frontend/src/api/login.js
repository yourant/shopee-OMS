import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/operation/manager/passport/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/operation/manager/permission/get-info-to-login',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/operation/manager/passport/logout',
    method: 'post'
  })
}
