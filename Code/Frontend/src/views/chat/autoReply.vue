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
              v-for="(item, index) in siteCodeList"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>
          <el-form-item>
            <el-button
              type="primary"
              @click="getList"
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
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="addBatch"
        >
          批量添加
        </el-button>
      </el-row>
    </div>

    <!--表格-->
    <div class="content-box">
      <el-table
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          width="100"
          label="ID"
        />
        <el-table-column
          prop="site_code"
          width="100"
          label="站点"
        />
        <el-table-column
          prop="antistop"
          width="250"
          label="关键字"
        />
        <el-table-column
          prop="reply"
          min-width="300"
          label="回复内容"
        />
        <el-table-column
          label="操作"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="deleteItem(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
    <!--批量添加dialog-->
    <add-batch
      v-bind.sync="addBatchDialog"
      :site-list="siteCodeList"
      @reload="getList"
    />
  </div>
</template>

<script>
  import { fetchReply, fetchReplyDelete } from '@/api/chat'
  import addBatch from './components/autoReply/addBatch'
  export default {
    name: 'Bargain',
    components: {
      addBatch
    },
    data() {
      return {
        listLoading: false,
        maxHeight: document.documentElement.clientHeight - 200,
        // 权限
        permission: {
          edit: 'operation.chat.auto-tips.set-tips'
        },
        // 表格相关内容
        listQuery: {
          site_code: undefined
        },
        listData: [],
        siteCodeList: [],
        pagination: null,
        // 批量
        addBatchDialog: {
          open: false
        }
      }
    },
    created() {
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          this.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
      this.getList()
    },
    methods: {
      // 获取列表
      getList() {
        this.listLoading = true
        this.listData = []
        this.siteCodeList = []
        fetchReply(this.listQuery).then((res) => {
          this.listData = res.data.list
          this.siteCodeList = res.data.site_code
          this.pagination = res.data.pagination
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 清楚
      clearSearch() {
        this.listQuery.site_code = undefined
        this.getList()
      },
      // 分页
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
        this.getList()
      },
      // 删除
      deleteItem(row) {
        this.$confirm(`是否删除${row.site_code}站点下“${row.antistop}”的回复`, '提示',
                      {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning'
                      }).then(_ => {
          fetchReplyDelete({ id: row.id }).then(response => {
            this.getList()
          })
        }).catch(_ => {
        })
      },
      // 批量添加
      addBatch() {
        this.addBatchDialog = {
          open: true
        }
      }
    },
    watch: {
      maxHeight(val) {
        if (!this.timer) {
          this.maxHeight = val
          this.timer = true
          setTimeout(() => {
            this.timer = false
          }, 400)
        }
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .explan{
    font-size: 12px;
    color: #E6A23C;
    line-height: 20px;
  }
</style>

