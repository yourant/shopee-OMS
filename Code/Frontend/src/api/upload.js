import request from '@/utils/request'

/* 上传图片登录 */
export function apiUploadLogin(data) {
  return request({
    url: '/operation/token-test-controller/authorizations',
    method: 'post',
    data
  })
}
