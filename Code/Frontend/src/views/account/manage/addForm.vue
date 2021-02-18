<template>
  <el-dialog
    :title="operation === 'add' ? '添加账号' : '编辑账号'"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form
        v-loading="loading"
        ref="form"
        :model="form"
        :rules="rules"
        label-width="130px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item
          label="站点"
          prop="site_code"
        >
          <el-select
            style="width: 90%"
            v-model="form.site_code"
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
            style="width: 90%"
            v-model="form.account"
            clearable
            placeholder="请输入账号"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            style="width: 90%"
            v-model="form.password"
            clearable
            placeholder="请输入账号密码"
          />
        </el-form-item>
        <!--<el-form-item label="自动回复" prop="description">-->
        <!--<el-input-->
        <!--style="width: 90%"-->
        <!--type="textarea"-->
        <!--:autosize="{ minRows: 4, maxRows: 8}"-->
        <!--v-model="form.description">-->
        <!--</el-input>-->
        <!--<br>-->
        <!--<div class="tips">您可以在这跟买家打声招呼、写些商店规则、促销活动或是任何您想跟买家沟通的讯息，但最多不可以超过500个字。</div>-->
        <!--</el-form-item>-->
      </el-form>
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="loading"
        @click="onCancel"
      >
        取 消
      </el-button>
      <el-button
        :disabled="loading"
        type="primary"
        @click="addSite('form')"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { addAccount, editAccount } from '@/api/account'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      formData: {
        type: Object,
        default: () => {
          return {
            account: '',
            password: '',
            site_code: ''
          }
        }
      },
      operation: {
        type: String,
        default: ''
      },
      siteCode: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        options: [],
        rules: {
          site_code: [
            { required: true, message: '请选择站点', trigger: 'change' }
          ],
          password: [
            { required: true, message: '请输入账号密码', trigger: 'blur' },
            { min: 0, max: 100, message: '最大长度为100个字符', trigger: 'blur' }
          ],
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 1, max: 100, message: '最大长度为100个字符', trigger: 'blur' }
          ]
        },
        loading: false,
        initData: {},
        form: {}
      }
    },
    created() {
    },
    methods: {
      addSite(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            const form = {
              site_code: this.form.site_code,
              account: this.form.account,
              password: this.form.password
            }
            if (this.operation === 'add') {
              form.create_user_id = store.getters.userInfo.id
              form.create_user_name = store.getters.userInfo.name
              addAccount(form).then(response => {
                this.loading = false
                this.closeClearForm()
                this.$emit('reload')
              }).catch(() => {
                this.loading = false
              })
            } else {
              const isSame = this._.isEqual(this.form, this.initData)
              if (isSame) {
                this.closeClearForm()
              } else {
                form.update_user_name = store.getters.userInfo.name
                form.update_user_id = store.getters.userInfo.id
                form.id = this.form.id
                editAccount(form).then(response => {
                  this.loading = false
                  this.closeClearForm()
                  this.$emit('reload')
                }).catch(() => {
                  this.loading = false
                })
              }
            }
          } else {
            return false
          }
        })
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.loading = false
        this.$refs['form'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      }
    },
    watch: {
      formData: {
        deep: true,
        immediate: true,
        handler(val) {
          if (val) {
            const data = this._.cloneDeep(this.formData)
            this.initData = this._.cloneDeep(this.formData)
            this.form = data
          }
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form-item {
    p {
      margin: 0;
      color: #F56C6C;
      font-size: 12px;
    }

    .tips {
      width: 90%;
      line-height: 1.7;
      color: #999999;
      font-size: 12px
    }
  }
</style>
