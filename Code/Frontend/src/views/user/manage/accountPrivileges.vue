<template>
  <el-dialog
    title="账号配置"
    class="dialog-edit-user-roles"
    v-if="open"
    :visible="true"
    v-loading="listLoading"
    :before-close="onCancel"
    :close-on-click-modal="false"
    :close-on-pres-sescape="false"
    width="680px"
  >
    <div v-loading="loading">
      <el-input
        size="mini"
        placeholder="输入关键字进行过滤"
        clearable
        v-model="filterText"
      />
      <br>
      <br>
      <el-tree
        :check-on-click-node="true"
        class="filter-tree"
        @check-change="treeChange"
        :data="showData"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        :expand-on-click-node="false"
        default-expand-all
        empty-text="暂无可配置账号"
        :filter-node-method="filterNode"
        :default-checked-keys="selectList"
        icon-class="el-icon-d-arrow-right"
        ref="tree"
      />
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <!--<el-button type="primary" plain="" @click="resetChecked">清 空</el-button>-->
      <el-button
        :disabled="loading"
        @click="onCancel"
      >
        取 消
      </el-button>
      <el-button
        :disabled="loading"
        type="primary"
        @click="saveUserRoles"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    editUserAccount
  } from '@/api/user'

  export default {
    props: {
      data: {
        type: Array,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      },
      uuData: {
        type: Array,
        default: () => []
      },
      operation: {
        type: String,
        default: 'add'
      },
      defaultKeys: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        listLoading: false,
        superior_role_options: [],
        checkedRoles: [],
        filterText: '',
        defaultProps: {
          children: 'child',
          label: 'account'
        },
        loading: false,
        initDefault: [],
        selectList: [],
        showData: [],
        baseData: []
      }
    },
    methods: {
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
            if (this._.includes(selectKey, v1.id)) {
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
                if (v1.id === v3.id) {
                  v3.selected = v1.selected
                }
              })
            })
          })
        })
      },
      /* 清空 */
      resetChecked() {
        this.$refs.tree.setCheckedKeys([])
      },
      saveUserRoles() {
        const father = []
        this._.forEach(this.showData, (v, i) => {
          father.push(v.id)
        })
        const checkedKeys = []
        this._.forEach(this.baseData, v => {
          this._.forEach(v.child, v1 => {
            if (v1.selected) {
              checkedKeys.push(Number(v1.id))
            }
          })
        })
        const roleParams = {
          account_ids: checkedKeys
        }
        if (this.operation === 'add') {
          this.$emit('reload', roleParams)
          this.closeClearForm()
        } else {
          const isSame = this._.isEqual(this.defaultKeys.map(Number).sort(), checkedKeys.sort())
          if (isSame) {
            this.closeClearForm()
            return
          }
          this.loading = true
          roleParams.user_id = this.uuData[0].id
          editUserAccount(roleParams).then(res => {
            this.loading = false
            this.$emit('reload')
            this.closeClearForm()
          }).catch(() => {
            this.loading = false
          })
        }
      },
      onCancel() {
        this.loading = false
        this.filterText = ''
        this.checkedRoles = []
        this.resetChecked()
        this.closeClearForm()
      },
      closeClearForm() {
        this.loading = false
        this.filterText = ''
        this.checkedRoles = []
        this.$emit('update:open', false)
      }
    },
    watch: {
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
        this.$refs.tree.setCheckedKeys(setKey)
      },
      defaultKeys: {
        deep: true,
        immediate: true,
        handler(val) {
          if (val) {
            this.selectList = this._.cloneDeep(this.defaultKeys)
          }
        }
      },
      data: {
        deep: true,
        handler(val) {
          this.showData = this._.cloneDeep(this.data)
          this.baseData = this._.cloneDeep(this.data)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
<style rel="stylesheet/scss" lang="scss">
  .filter-tree {
    & > .el-tree-node {
      & > .el-tree-node__content {
        background-color: #e6eaef;
        margin: 1px 0;
      }
      & > .el-tree-node__children {
        background-color: #eff3f8;
        & > .el-tree-node {
          min-width: 25%;
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
