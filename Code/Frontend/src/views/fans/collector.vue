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
            style="width:100px"
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
          label="店铺URL"
          prop="url"
        >
          <el-input
            style="width:250px;"
            v-model="listQuery.url"
            placeholder="请输入店铺地址"
            clearable
            @blur="trimString('url')"
          />
        </el-form-item>
        <el-form-item
          label="创建人"
          prop="create_user_name"
        >
          <el-input
            v-model="listQuery.create_user_name"
            placeholder="请输入创建人"
            clearable
            style="width:150px"
            @blur="trimString('create_user_name')"
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
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="addCollect"
          v-permission="permission.add"
        >
          批量采集
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
          width="80"
        />
        <el-table-column
          prop="item_line_name"
          label="产品线"
          min-width="150"
        />
        <el-table-column
          prop="url"
          label="店铺URL"
          min-width="150"
        >
          <template slot-scope="scope">
            <div class="domain_url">
              <span :class="'url_name' + scope.row.id">{{ scope.row.url }}</span>
              <el-button
                type="text"
                class="domain_btn"
                v-show="scope.row.status === STATUS_CODE.success"
                @click="copyURL(scope.row)"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="执行状态"
        >
          <template slot-scope="scope">
            <el-tag
              type="info"
              size="small"
              v-if="scope.row.status === STATUS_CODE.unxecuted"
            >
              执行中
            </el-tag>
            <!--<el-tag type="danger" size="small" v-else-if="scope.row.status === STATUS_CODE.fail">执行出错</el-tag>-->
            <el-tag
              type="success"
              size="small"
              v-else-if="scope.row.status === STATUS_CODE.success"
            >
              执行完成
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="create_user_name"
          label="创建人"
        />
        <!--prop="update_time"-->
        <el-table-column
          label="更新时间"
        >
          <template slot-scope="scope">
            <div>{{ fattTime(scope.row.update_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="operationAgain(scope.row)"
              v-if="scope.row.status === STATUS_CODE.success"
              v-permission="permission.again"
            >
              再次执行
            </el-button>
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
      :product-line="productLine"
    />
  </div>
</template>

<script>
  import { fetchCollectorList, fetchCollectorFansAgain, fetchProductLine } from '@/api/fans'
  import addForm from './components/addForm'
  import { filterQueryParams, fattCreateTime } from '@/utils'

  export default {
    name: 'Collector',
    components: { addForm },
    data() {
      return {
        // 权限
        permission: {
          add: 'operation.collection.collection-fans.add-collection-task',
          again: 'operation.collection.collection-fans.again-collection'
        },
        // 执行结果状态
        STATUS_CODE: {
          unxecuted: '10',
          success: '20'
        // fail: 30
        },
        // 店铺采集
        detailsSiteDialogOption: {
          formData: {},
          open: false
        },
        // 表格相关
        newDate: new Date().getTime(),
        maxHeight: document.documentElement.clientHeight - 200,
        listLoading: true,
        // 表格数据
        listData: [],
        listQuery: {
          page: 1,
          per_page: 10,
          create_user_name: '',
          url: '',
          site_code: ''
        },
        siteCode: [],
        pagination: null,
        productLine: []
      }
    },
    created() {
      this.renderList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
      this.getProductLine()
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
      fattTime(time) {
        return fattCreateTime(Number(time) * 1000)
      },
      trimString(val) {
        this.listQuery[val] = this._.trim(this.listQuery[val])
      },
      renderList() {
        this.listLoading = true
        this.listData = null
        const queryParams = filterQueryParams(this.listQuery)
        fetchCollectorList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.siteCode = response.data.site_code
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).catch(() => {
          this.listLoading = false
        })
      },
      getProductLine() {
        fetchProductLine().then(response => {
          this.productLine = response.data
        }).catch(() => {})
      },
      // 再次执行
      operationAgain(row) {
        this.$confirm(`是否再次收集该店铺的粉丝数据？`, '提示',
                      {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning'
                      }).then(_ => {
          this.listLoading = true
          const params = {
            id: row.id
          // create_user_id: store.getters.userInfo.id
          }
          fetchCollectorFansAgain(params).then(response => {
            this.listLoading = false
            this.renderList()
          })
        }).catch(_ => {
          this.listLoading = false
        })
      },
      // 店铺采集
      addCollect() {
        this.detailsSiteDialogOption = {
          open: true,
          formData: {}
        }
      },
      // 清空
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.renderList()
      },
      // url复制
      copyURL(row) {
        copyText(row.url, () => { console.log('复制成功 \n复制内容内容' + row.url) })
        // 复制的方法
        function copyText(text, callback) {
          const tag = document.createElement('input')
          tag.setAttribute('id', 'cp_hgz_input')
          tag.value = text
          document.getElementsByTagName('body')[0].appendChild(tag)
          document.getElementById('cp_hgz_input').select()
          document.execCommand('copy')
          document.getElementById('cp_hgz_input').remove()
          if (callback) {
            callback(text)
          }
        }
      },
      // 分页
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
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
  .domain_url {
    .domain_btn {
      display: none;
    }
    &:hover {
      display: flex;
      justify-content: space-between;
      .domain_btn {
        display: block;
        padding: 0;
      }
    }
  }
</style>
