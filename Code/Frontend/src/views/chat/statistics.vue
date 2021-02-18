<template>
  <div>
    <div class="header-box">
      <el-button @click="openDialog('siteManager')" type="primary" size="mini">site/account-客服</el-button>
      <el-button @click="openDialog('managerSite')" type="primary" size="mini">客服-site/account</el-button>
      <el-button @click="openDialog('replyCount')" type="primary" size="mini">客服日回复数量</el-button>
      <el-button @click="openDialog('message')" type="primary" size="mini">消息内容导出</el-button>
    </div>
    <statistics v-bind.sync="messageExport"></statistics>
  </div>
</template>

<script>
  import statistics from './components/statistics'
  export default {
    name: 'Statistics',
    components: { statistics },
    data() {
      return {
        messageExport: {
          open: false,
          type: ''
        }
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      openDialog(type) {
        this.messageExport = {
          open: true,
          type
        }
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
