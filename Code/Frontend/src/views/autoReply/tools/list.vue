<template>
  <div>
    <div class="tool-parent">
      <div class="tool-child" v-permission="permissions.export" @click="transition">
        <svg-icon iconClass="export"></svg-icon>
        <el-button type="text">自动回复率统计</el-button>
      </div>
      <div class="tool-child" v-permission="permissions.order_export" @click="exportOrder">
        <svg-icon iconClass="export"></svg-icon>
        <el-button type="text">退款/退货</el-button>
      </div>
    </div>
    <!--转换弹窗-->
    <export-response-rate v-bind.sync="exportDataDialog"></export-response-rate>
  </div>
</template>

<script>
import exportResponseRate from '@/views/autoReply/tools/exportResponseRate'
import axios from 'axios'
import qs from 'qs'
import { getToken } from '@/utils/auth'

export default {
  components: { exportResponseRate },
  data() {
    return {
      permissions: {
        export: 'operation.chat-statistics.auto-reply-rate',//自动回复率统计
        order_export: 'operation.toolbar.return-order.export-return-order-account'
      },//权限
      exportDataDialog: {
        open: false
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    transition() {
      this.exportDataDialog = {
        open: true
      }
    },
    exportOrder() {
      const basePath = process.env.NODE_ENV === 'development' ? 'http://190.168.3.228:8000/' : process.env.VUE_APP_BASE_API
      const url = `${ basePath }operation/toolbar/return-order/export-return-order-account`
      const loading = this.$loading({
        lock: true,
        text: `加载中`,
        spinner: 'el-icon-loading',
        background: 'rgba(f, f, f, 0.5)'
      })
      axios({
        url,
        method: 'post',
        data: qs.stringify({ status: 1 }),
        headers: {
          Authorization: getToken()
        },
        responseType: 'blob'
      }).then(res => {
        // 接口返回文件流
        if (res.data.type.indexOf('json') === -1) {
          const date = this.$moment(new Date().getTime()).format('YYYYMMDDHHmmss')
          const file_name = `Shopee退款/退货数据-${ date }.xlsx`
          let url = window.URL.createObjectURL(new Blob([res.data]))
          let a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.setAttribute('download', file_name)
          document.body.appendChild(a)
          this.$message.success('导出成功')
          a.click() //执行下载
          window.URL.revokeObjectURL(a.href)
          document.body.removeChild(a)
          loading.close()
        } else {
          // 接口返回json
          const _this = this
          const reader = new FileReader()
          reader.readAsText(res.data, 'utf-8');
          reader.onload = function () {
            _this.$message.error(JSON.parse(reader.result).message)
            loading.close()
          }
        }

      }).catch(err => {
        this.$message.error(err.message)
        loading.close()
      })
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tool-parent {
  display: flex;

  .tool-child {
    margin: 15px;
    text-align: center;
    cursor: pointer;
  }
}

.svg-icon {
  font-size: 38px;
  margin: 20px 20px 0 20px;
  color: #0078d7;
  display: block;
}
</style>
