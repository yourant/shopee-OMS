import { Message } from 'element-ui'

/**
 * 上传地址
 */
export const getUploadPath = () => {
  const API_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API
  return API_ADDRESS + 'operation/chat/send-image/send'
}

export const getDownLoadPath = () => {
  const basePath = process.env.NODE_ENV === 'development' ? 'http://190.168.3.228:8000/' : process.env.VUE_APP_BASE_API
  return `${basePath}operation/chat-statistics/down-load-excel?`
}

/**
 * 验证图片格式
 * 图片格式：jpg、gif、png
 * 大小限制：小于等于1M
 * */
export const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isGIF = file.type === 'image/jpg'
  const isPNG = file.type === 'image/png'
  const isLt1M = file.size / 1024 / 1024 < 1
  const isImageMsg = '请上传正确的图片（jpg、jpeg、png）'
  const isLt1mbMsg = '图片大小不能超过 1MB'
  if (!(isJPG || isGIF || isPNG)) {
    Message({
      message: isImageMsg,
      type: 'error',
      showClose: true,
      duration: 3000
    })
    return isJPG || isGIF || isPNG
  }
  if (!isLt1M) {
    Message({
      message: isLt1mbMsg,
      type: 'error',
      showClose: true,
      duration: 3000
    })
  }
  return isLt1M
}
