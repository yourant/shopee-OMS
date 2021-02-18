<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
        size="mini"
      >
        <el-form-item
          label="站点"
          prop="site_code"
        >
          <el-select
            v-model="listQuery.site_code"
            clearable
            placeholder="选择站点"
          >
            <el-option
              v-for="(item, index) in siteCode"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="账号"
          prop="account"
        >
          <el-input
            v-model="listQuery.account"
            clearable
            placeholder="请输入账号"
            @blur="trimString"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleFilter"
          >
            搜索
          </el-button>
          <el-button
            data-type="clear"
            @click="clearSearch"
          >
            清空
          </el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <!--<el-row class="right-row">-->
      <!--<el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addSite('add')">添加账户</el-button>-->
      <!--</el-row>-->
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        empty-text="暂无相关结果"
        border
        :max-height="maxHeight"
        style="width: 100%"
        @filter-change="handleFilterChange"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          sortable
        />
        <el-table-column
          prop="site_code"
          label="站点"
        />
        <el-table-column
          prop="account"
          label="账号"
        />
        <el-table-column
          prop="following_count"
          label="我的关注"
        />
        <el-table-column
          prop="followers_count"
          label="我的粉丝"
        />
        <!--<el-table-column label="操作" width="100" align="center">-->
        <!--<template slot-scope="scope">-->
        <!--<el-button type="text" size="mini" @click="attention(scope.row)" v-permission="permission.add">添加粉丝</el-button>-->
        <!--</template>-->
        <!--</el-table-column>-->
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import { fetchFasList } from '@/api/fans'
  import { filterQueryParams, fattCreateTime } from '@/utils'
  import store from '@/store'

  export default {
    name: 'UserManage',
    data() {
      return {
        // permission
        // permission: {
        //   add: 'operation.follower.follower.add'
        // },
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        detailsSiteDialogOption: {
          data: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          user_id: store.getters.userInfo.id,
          page: 1,
          per_page: 10,
          account: '',
          site_code: ''
        },
        siteCode: [],
        pagination: null,
        // 前端权限
        permissions: {
          info: 'cdiscount.advt.product-upload-plan.info',
          add: 'cdiscount.advt.product-upload-plan.add'
        }
      }
    },
    created() {
      this.renderList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    methods: {
      trimString() {
        this.listQuery.account = this._.trim(this.listQuery.account)
      },
      renderList() {
        this.listLoading = true
        this.listData = null
        const queryParams = filterQueryParams(this.listQuery)
        fetchFasList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.siteCode = response.data.site_code
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      editSite(data, operation) {
        this.detailsSiteDialogOption = {
          open: true,
          formData: data,
          operation: operation
        }
      },
      addSite(operation) {
        this.detailsSiteDialogOption = {
          open: true,
          formData: { },
          operation: operation
        }
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.renderList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.renderList()
      },
      // 筛选图标处理
      handleFilterChange(filters) {
        if (filters.status instanceof Array) {
          if (filters.status.length === 0) {
            this.filter = 'filter'
            document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
          } else {
            this.filter = 'filter-in'
            document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
          }
        }
      },
      /* 关注 */
      // attention(row) {
      //   this.$router.push({ name: 'fans.add', query: { site_code: row.site_code, id: row.shop_id }})
      // },
      // 格式化时间
      fattTime(time) {
        return fattCreateTime(Number(time) * 1000)
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
