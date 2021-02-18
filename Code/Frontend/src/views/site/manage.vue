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
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="addSite('add')"
          v-permission="permission.add"
        >
          添加站点
        </el-button>
      </el-row>
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
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          sortable
          :sort-method="(a,b) => a-b"
        />
        <el-table-column
          prop="site_code"
          label="站点"
          width="80"
        />
        <el-table-column
          prop="description"
          label="站点描述"
        />
        <el-table-column
          prop="domain"
          label="站点URL"
          min-width="100"
        />
        <el-table-column
          prop="create_user_name"
          label="创建人"
        />
        <el-table-column
          prop="create_time"
          label="创建时间"
        >
          <template slot-scope="scope">
            <div>{{ fattTime(scope.row.create_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="tips_status"
          label="状态"
          width="100"
          column-key="tips_status"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.site_status === '1' ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ scope.row.site_status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              v-permission="permission.edit"
              @click="enableOperation(scope.row)"
            >
              {{ scope.row.site_status === '1' ? '禁用': '启用' }}
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="editSite(scope.row, 'edit')"
              v-permission="permission.edit"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="deleteUser(scope.row)"
              v-permission="permission.delete"
            >
              删除
            </el-button>
            <!--<el-button type="text" size="mini" @click="editUserRoles(scope.row)">修改角色</el-button>-->
          </template>
        </el-table-column>
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
    <!--添加计划弹窗dialog-->
    <add-form
      v-bind.sync="detailsSiteDialogOption"
      @reload="renderList"
    />
  </div>
</template>

<script>
  import { fetchPlanList, delSiteRequest } from '@/api/site'
  import addForm from './manage/addForm'
  import { editSite } from '@/api/site'
  import { filterQueryParams, fattCreateTime } from '@/utils'

  export default {
    name: 'UserManage',
    components: { addForm },
    data() {
      return {
        // 权限
        permission: {
          add: 'operation.site.site.add',
          delete: 'operation.site.site.delete',
          edit: 'operation.site.site.set'
        },
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        detailsSiteDialogOption: {
          formData: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10,
          site_code: undefined
        },
        siteCode: [],
        pagination: null
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
      renderList() {
        this.listLoading = true
        this.listData = null
        const queryParams = filterQueryParams(this.listQuery)
        if (queryParams.type === 'all') {
          delete queryParams.type
        }
        fetchPlanList(queryParams).then(response => {
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
        const d = this._.cloneDeep(data)
        this.detailsSiteDialogOption = {
          open: true,
          formData: d,
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
      /* 用户删除 */
      deleteUser(d) {
        const data = {
          id: d.id,
          update_user_id: this.$store.getters.userInfo.id
        }
        this.$confirm('确认删除？', '提示',
                      { confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning' }).then(_ => {
                          delSiteRequest(data).then(response => {
                            this.renderList()
                          })
                        }).catch(_ => {
          })
      },
      // 禁用/启用
      enableOperation(row) {
        const tips = row.site_status === '1' ? '禁用' : '启用'
        const use_abled = row.site_status === '1' ? '相关聊聊、粉丝模块不可使用，相关账号不可配置' : '相关聊聊、粉丝模块可正常使用，相关账号可配置'
        const status = row.site_status === '1' ? '0' : '1'
        const h = this.$createElement
        this.$msgbox({
          title: '消息',
          message: h('div', null, [
            h('p', { style: 'display: flex; align-item: center' }, [
              h('i', { class: 'el-icon-warning', style: 'color: #E6A23C; padding-right: 10px; font-size: 24px' }),
              h('span', { style: 'font-size: 14px;' }, `是否${tips}${row.site_code}站点`)
            ]),
            h('p', { style: 'font-size: 12px;line-height:20px;color:#F56C6C;padding-left:35px' }, use_abled)
          ]),
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(_ => {
          this.listLoading = true
          this.editOperationData({ id: row.id, site_status: status }).catch(_ => { this.listLoading = false })
        })
      },
      // 编辑后端返回内容
      editOperationData(params) {
        return new Promise((resolve, reject) => {
          // 后端连接
          editSite(params).then(res => {
            resolve()
            this.renderList()
          }).catch(_ => {
            reject()
          })
        })
      },
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
