<template>
  <el-dialog
    :title="dialogTitle"
    :visible="open"
    :before-close="onClose"
    class="dialog-edit-user-roles"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <div>
      <div>
        <el-form size="small" ref="formData" :model="formData" label-width="120px">
          <el-form-item label="时间范围" class="is-required" v-if="type !== 'message'" prop="date">
            <el-date-picker
              v-model="formData.date"
              value-format="timestamp"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="selectTime"
            >
            </el-date-picker>
            <div class="error-tip" v-if="dateTip">{{ dateTipContent[this.type] }}</div>
          </el-form-item>
          <el-form-item label="时间范围" required v-else prop="date">
            <el-date-picker
              v-model="formData.date"
              value-format="timestamp"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="selectTime"
            >
            </el-date-picker>
            <div class="error-tip" v-if="dateTip">{{ dateTipContent[this.type] }}</div>
          </el-form-item>
          <el-form-item label="账号选择" v-if="type === 'siteManager' || type === 'message'">
            <div v-loading="loading">
              <el-input
                size="mini"
                placeholder="输入关键字进行过滤"
                clearable
                v-model="filterText"
              />
              <!--<el-tree-->
                <!--:check-on-click-node="true"-->
                <!--class="filter-tree"-->
                <!--@check-change="treeChange"-->
                <!--:data="showData"-->
                <!--show-checkbox-->
                <!--node-key="account_id"-->
                <!--:props="defaultProps"-->
                <!--:expand-on-click-node="false"-->
                <!--empty-text="暂无可导出账号"-->
                <!--:filter-node-method="filterNode"-->
                <!--icon-class="el-icon-d-arrow-right"-->
                <!--ref="tree"-->
              <!--/>-->
              <div v-if="showData && showData.length">
                <div class="tree" v-for="(parent,ind) in showData" :key="ind">
                  <div class="tree-parent">
                    <svg-icon :class="parent.expand ? 'expand' : 'not-expand'" icon-class="right" style="color:rgb(64, 158, 255);font-size: 16px;cursor:pointer;" @click="changeTreeExpand(ind)"/>
                    <el-checkbox v-model="parent.selected" @change="parentSelectChange(ind)">{{ parent.account }}</el-checkbox>
                  </div>
                  <div class="tree-child" v-if="parent.expand">
                    <el-checkbox v-for="(child,ind1) in parent.child" v-model="child.selected" @change="childSelectChange(ind,ind1)" :key="ind1">{{ child.account }}</el-checkbox>
                  </div>
                </div>
              </div>
              <div v-else style="color:#888;">暂无可导出账号</div>
            </div>
          </el-form-item>
          <el-form-item label="客服人员" v-if="type !== 'siteManager'" prop="manager">
            <el-select v-model="formData.manager" placeholder="请选择客服人员" size="mini" multiple collapse-tags style="width:350px;" clearable>
              <el-option v-for="(item,index) in userListOption" :label="item.name" :value="item.user_id" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="消息类型" v-if="type === 'message'" size="mini" prop="msg_type">
            <el-select v-model="formData.msg_type" placeholder="请选择消息类型" clearable>
              <el-option v-for="(item,index) in messageTypeOption" :label="item.label" :value="item.value" :key="index"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="loading"
        size="mini"
        @click="onCancel"
      >
        取 消
      </el-button>
      <el-button
        :disabled="loading"
        size="mini"
        type="primary"
        @click="exportSelectData"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { statisticsConversationOptions, exportConversationStatistics } from '@/api/chat'
  import qs from 'qs'
  import { getDownLoadPath } from '@/utils/help'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false,
        required: true
      },
      type: {
        type: String,
        default: '',
        required: true
      }
    },
    data() {
      return {
        filterText: '',
        loading: false,
        showData: [],
        baseData: [],
        originData: [],
        userListOption: [],
        messageTypeOption: [],
        defaultProps: {
          children: 'child',
          label: 'account'
        },
        selectList: [],
        dialogTitle: '',
        dateTip: false,
        dateTipContent: {
          siteManager: '时间间隔必填且最大区间不能超出180天',
          managerSite: '时间间隔必填且最大区间不能超出180天',
          replyCount: '时间间隔必填且最大区间不能超出30天',
          message: '时间间隔必填且最大区间不能超出30天'
        },
        formData: {
          date: [],
          manager: [],
          shop: '',
          msg_type: undefined
        },
        account_id: 0
      }
    },
    created() {
      this.init()
    },
    methods: {
      changeTreeExpand(ind) {
        this.showData[ind].expand = !this.showData[ind].expand
      },
      childSelectChange(ind,ind1) {
        this.baseData = this._.cloneDeep(this.showData)
      },
      parentSelectChange(ind) {
        this.showData[ind].child.forEach(v => {
          v.selected = this.showData[ind].selected
        })
        this.baseData = this._.cloneDeep(this.showData)
      },
      init() {
        statisticsConversationOptions().then(res => {
          const showData = []
          for(let key in res.data.account_list) {
            showData.push({ account_id: this.account_id * 10000, account: key, child: res.data.account_list[key], selected: false, expand: false })
            this.account_id++
          }
          this.showData = this._.cloneDeep(showData)
          this.baseData = this._.cloneDeep(showData)
          this.originData = this._.cloneDeep(showData)
          this.userListOption = res.data.user_list
          this.messageTypeOption = res.data.message_type
        })
      },
      exportSelectData() {
        if(this.checkTime()) {
          let account_ids = []
          this._.forEach(this.baseData, v => {
            this._.forEach(v.child, v1 => {
              if (v1.selected) {
                account_ids.push(Number(v1.account_id))
              }
            })
          })
          account_ids = account_ids.join(',')
          let managers = this.formData.manager && this.formData.manager.length ? this.formData.manager.join(',') : ''
          let obj = {
            start_time: this.formData.date[0] / 1000,
            end_time: this.formData.date[1] / 1000,
            not_show_message: true
          }
          switch (this.type) {
            case 'siteManager':
              obj = Object.assign(obj, { account_ids, export_type: 1 })
              break
            case 'managerSite':
              obj = Object.assign(obj, { managers, export_type: 2 })
              break
            case 'replyCount':
              obj = Object.assign(obj, { managers, export_type: 3 })
              break
            case 'message':
              obj = Object.assign(obj, { managers, account_ids, msg_type: this.formData.msg_type, export_type: 4 })
              break
            default:
              break
          }
          const params = {}
          for(let key in obj) {
            if(obj[key] === 0 || obj[key]) {
              params[key] = obj[key]
            }
          }
          const loading = this.$loading({
            lock: true,
            text: '正在努力下载',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
          })
          exportConversationStatistics(params).then(res => {
            if(res.code === 200) {
              setTimeout(() => {
                const a = document.createElement('a')
                a.href = `${getDownLoadPath()}${qs.stringify(res.data)}`
                a.download = `${getDownLoadPath()}${qs.stringify(res.data)}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                loading.close()
              },1000)
            } else {
              this.$message.error(res.message)
            }
          }).catch((err) => {
            this.$message.error(err)
            loading.close()
          })
        }
      },
      selectTime() {
        if(this.formData.date && this.formData.date.length) {
          const days = (new Date(this.formData.date[1]).getTime() - new Date(this.formData.date[0]).getTime()) / 86400000
          if (this.type === 'siteManager' || this.type === 'managerSite') {
            // 86400000 一天,最大区间不超过 6个月
            if (days > 180) {
              this.dateTip = true
              this.formData.date = []
            } else {
              this.dateTip = false
            }
          } else {
            // 最大区间不超过 1个月
            if (days > 30) {
              this.dateTip = true
              this.formData.date = []
            } else {
              this.dateTip = false
            }
          }
        } else {
          this.dateTip = true
        }
      },
      checkTime() {
        if(this.formData.date && this.formData.date.length) {
          const days = (new Date(this.formData.date[1]).getTime() - new Date(this.formData.date[0]).getTime()) / 86400000
          if (this.type === 'siteManager' || this.type === 'managerSite') {
            // 86400000 一天,最大区间不超过 6个月
            if (days > 180) {
              this.dateTip = true
              this.formData.date = []
              return false
            }
            return true
          } else {
            // 最大区间不超过 1个月
            if (days > 30) {
              this.dateTip = true
              this.formData.date = []
              return false
            }
            return true
          }
        } else {
          this.dateTip = true
          return false
        }
      },
      /* 筛选角色 */
      filterNode(value, data) {
        if (!value) {
          return true
        }
        return data.account.indexOf(value) !== -1
      },
      treeChange() {
        const selectKey = this.$refs.tree.getCheckedKeys()
        // 根据选中的key 修改展示的 selected
        this._.forEach(this.showData, v => {
          this._.forEach(v.child, v1 => {
            if (this._.includes(selectKey, v1.account_id)) {
              v1.selected = 1
            } else {
              v1.selected = 0
            }
          })
        })
        // 根据展示的 id 修改基础数据的 selected
        this._.forEach(this.showData, v => {
          this._.forEach(v.child, v1 => {
            this._.forEach(this.baseData, v2 => {
              this._.forEach(v2.child, v3 => {
                if (v1.account_id === v3.account_id) {
                  v3.selected = v1.selected
                }
              })
            })
          })
        })
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.$emit('update:open', false)
        this.dateTip = false
        this.formData = {
          date: [],
          manager: [],
          shop: '',
          msg_type: undefined
        }
        this.showData = this._.cloneDeep(this.originData)
        this.baseData = this._.cloneDeep(this.originData)
      }
    },
    watch: {
      open(val) {
        if (val) {
          switch (this.type) {
            case 'siteManager':
              this.dialogTitle = 'site/account-客服'
              break
            case 'managerSite':
              this.dialogTitle = '客服-site/account'
              break
            case 'replyCount':
              this.dialogTitle = '客服日回复数量'
              break
            case 'message':
              this.dialogTitle = '消息内容导出'
              break
            default:
              this.dialogTitle = ''
              break
          }
        }
      },
      filterText(val) {
        const d = this._.trim(val)
        if (!d) {
          this.showData = this._.cloneDeep(this.baseData) || []
          return
        }
        this.showData = []
        // 筛选出展示的父集
        this._.forEach(this.baseData, v => {
          const cloneV = this._.cloneDeep(v)
          const hasSelected = this._.some(cloneV.child, v1 => {
            return this._.includes(v1.account, d)
          })
          if (hasSelected) {
            this.showData.push(cloneV)
          }
        })
        // 筛选出展示的子集
        this._.forEach(this.showData, v => {
          const cloneV = this._.filter(v.child, v1 => {
            return this._.includes(v1.account, d)
          })
          v.child = cloneV
        })
        // 根据选中的 key 重新设置 tree
        const setKey = []
        this._.forEach(this.baseData, v => {
          this._.forEach(v.child, v1 => {
            if (v1.selected) {
              setKey.push(v1.id)
            }
          })
        })
        // this.$refs.tree.setCheckedKeys(setKey)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .error-tip {
    margin: 0;
    color: #F56C6C;
    font-size: 12px;
  }
  .tree-parent {
    background-color: #e6eaef;
    margin: 1px 0;
  }
  .tree-child {
    padding-left: 20px;
    background-color: #eff3f8;
  }
  .expand {
    transform: rotate(90deg);
    transition: all .5s;
  }
  .not-expand {
    transform: rotate(0deg);
    transition: all .5s;
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .filter-tree {
    margin-top: 10px;
    & > .el-tree-node {
      & > .el-tree-node__content {
        background-color: #e6eaef;
        margin: 1px 0;
      }
      & > .el-tree-node__children {
        background-color: #eff3f8;
        & > .el-tree-node {
          min-width: 32%;
          float: left;
          & > .el-tree-node__content {
            margin: 1px 0;
          }
        }
      }
    }
    .el-tree-node__expand-icon {
      color: #409eff;
    }
    .el-tree-node__expand-icon.is-leaf {
      color: transparent;
    }
  }
</style>
