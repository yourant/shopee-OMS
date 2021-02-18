<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="执行状态" prop="status">
          <el-select v-model="listQuery.status" clearable placeholder="请选择">
            <el-option v-for="item of statusFilter" :label="item.text" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="user_name">
          <el-input size="mini" v-model="listQuery.user_name" clearable placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button v-permission="permissions.task_add" type="primary" size="mini" @click="addTask">创建</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <!--        ID、时间类型、时间段、账户、执行状态、操作人、操作时间（YYYY-MM-DD HH:MM）、操作（详情、下载）-->
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="schedule_type" label="店铺表现类型" width="130" align="center">
          <template slot-scope="scope">{{ scope.row.schedule_type === 1 ? '聊天表现' : '' }}</template>
        </el-table-column>
        <el-table-column prop="statistics_type" label="时间类型" width="80" align="center"></el-table-column>
        <el-table-column prop="statistics_time" label="时间段" width="360" align="center"></el-table-column>
        <el-table-column prop="site_code" label="账号" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.account_name.length > 90">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.account_name }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.account_name }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.account_name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" width="120" label="执行状态" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 20">执行中</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行完成</el-tag>
            <!--            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 40">正在执行</el-tag>-->
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center" width="120"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center" width="180">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button v-permission="permissions.task_detail" v-if="scope.row.status !== 10" type="text" size="mini" @click="getPlanDetails(scope.row)">详情</el-button>
            <el-button v-permission="permissions.task_download" v-if="scope.row.status === 30" type="text" size="mini" @click="downLoadData(scope.row.id)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加计划弹窗dialog-->
    <add-form v-bind.sync="addTaskDialogOption" @reload="getList"></add-form>
    <!--计划执行详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
  </div>
</template>

<script>
import { getPerformanceList } from '@/api/chat'
import addForm from './percentConversion/addForm'
import detailsForm from './percentConversion/detailsForm'
import { filterQueryParams } from '@/utils'
import { getToken } from '@/utils/auth'
import axios from 'axios'
import qs from 'qs'

export default {
  name: 'UserManage',
  components: { addForm, detailsForm },
  data() {
    return {
      permissions: {
        task_add: 'operation.schedule.store-performance-schedule.add-schedule',// 创建任务按钮
        task_detail: 'operation.schedule.store-performance-schedule.schedule-info-list',// 详情
        task_download: 'operation.schedule.store-performance-schedule.export-store-performance'// 下载
      },//权限
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addTaskDialogOption: {
        open: false
      },
      detailsPlanDialogOption: {
        detailData: {},
        open: false
      },
      listData: [],
      listLoading: false,
      listQuery: {
        // page: 1,
        // per_page: 10,
        user_name: '',
        status: undefined
      },
      pagination: null,
      statusFilter: [{ text: '未执行', value: 10 }, { text: '执行中', value: 20 }, { text: '执行完成', value: 30 }],
      options: {},
      /* 上传计划搜索条件列表 */
      selectOptions: ['LinioAdvtAccount']
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.resize()
  },
  methods: {
    downLoadData(schedule_id) {
      const basePath = process.env.NODE_ENV === 'development' ? 'http://190.168.3.228:8000/' : process.env.VUE_APP_BASE_API
      const url = `${ basePath }operation/schedule/store-performance-schedule/export-store-performance`
      const loading = this.$loading({
        lock: true,
        text: `加载中`,
        spinner: 'el-icon-loading',
        background: 'rgba(f, f, f, 0.5)'
      })
      axios({
        url,
        method: 'post',
        data: qs.stringify({ schedule_id }),
        headers: {
          Authorization: getToken()
        },
        responseType: 'blob'
      }).then(res => {
        const date = this.$moment(new Date().getTime()).format('YYYYMMDDHHmmss')
        const file_name = `Shopee-StoreconversationPerformance-${ date }.xlsx`
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
      }).catch(err => {
        this.$message.error(err.message)
        loading.close()
      })
    },
    resize() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    getList() {
      this.listData = []
      this.listLoading = true
      this.listQuery.user_name = this.listQuery.user_name.trim()
      const queryParams = filterQueryParams(this.listQuery)
      getPerformanceList(queryParams).then(res => {
        this.listLoading = false
        this.listData = res.data.list
        this.pagination = res.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    addTask() {
      this.addTaskDialogOption = {
        open: true
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        detailData: data
      }
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    },
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.options = response.data
      })
    },
    showStatus(val) {
      let state = ''
      switch (val) {
        case '未执行':
          state = 'info'
          break
        case '正在执行':
          state = 'primary'
          break
        case '执行成功':
          state = 'success'
          break
        case '执行出错':
          state = 'danger'
          break
        default:
          state = ''
      }
      return state
    }
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        const that = this
        setTimeout(function() {
          that.timer = false
        }, 400)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}
</style>
