<template>
  <el-upload
    ref="upload"
    class="img-upload"
    :action="uploadPath"
    :multiple="false"
    :accept="'.jpg, .jpeg, .png'"
    :data="uploadData"
    :headers="uploadHeaders"
    :before-upload="beforeAvatarUpload"
    :show-file-list="false"
    :on-progress="imgSend"
    :on-success="imgSuccess"
    :on-error="imgError"
    :file-list="fileList"
  >
    <svg-icon icon-class="pic" />
  </el-upload>
</template>
<script>
  import { getUploadPath } from '@/utils/help'
  import { getToken } from '@/utils/auth'
  export default {
    name: 'List',
    props: {
      baseObj: {
        type: Object,
        default: () => {}
      },
      productOption: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        fileList: [],
        uploadPath: getUploadPath(),
        uploadData: {
          url: '',
          token: '',
          to_id: ''
        },
        throttleSend: this._.throttle(() => {
          const obj = {
            url: ''
          }
          this.$emit('send-img', obj, 'image')
        }, 3000),
        isSending: false,
        beforeAvatarUpload: (file) => {
          const isJPG = file.type === 'image/jpeg'
          const isGIF = file.type === 'image/jpg'
          const isPNG = file.type === 'image/png'
          const isLt1M = file.size / 1024 / 1024 < 1
          const isImageMsg = '请上传正确的图片（jpg、jpeg、png）'
          const isLt1mbMsg = '图片大小不能超过 1MB'
          if (!(isJPG || isGIF || isPNG)) {
            this.$message({
              message: isImageMsg,
              type: 'error',
              showClose: true,
              duration: 3000
            })
            return isJPG || isGIF || isPNG
          }
          if (!isLt1M) {
            this.$message({
              message: isLt1mbMsg,
              type: 'error',
              showClose: true,
              duration: 3000
            })
            return false
          }
          if (!this.isSending) {
            this.isSending = true
            return true
          } else {
            this.$message({
              message: '发送图片中，请等待',
              type: 'error',
              showClose: true,
              duration: 3000
            })
            return false
          }
        }
      }
    },
    computed: {
      uploadHeaders() {
        const obj = {
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: getToken()
        }
        return obj
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      imgSuccess(res) {
        this.isSending = false
        if (res.data.url) {
          this.baseObj.content.url = res.data.url
          this.$emit('send-img-url', this.baseObj, this.baseObj.content)
        } else {
          this.imgError()
        }
        this.$refs.upload.clearFiles()
      },
      imgError() {
        this.isSending = false
        this.$emit('send-img-error', this.baseObj)
      },
      imgSend() {
        this.throttleSend()
      }
    },
    watch: {
      productOption() {
        this.uploadData = {
          url: this.productOption.platform,
          token: this.productOption.authorization.replace('Bearer ', ''),
          to_id: '0-' + this.productOption.data.to_id
        }
      }
    },
    filters: {}
  }
</script>

<style lang="scss" scoped>
  .img-upload {
    display: inline-block;
  }
  .svg-icon {
    font-size: 20px;
    color: #ff6700;
    cursor: pointer;
  }
</style>
