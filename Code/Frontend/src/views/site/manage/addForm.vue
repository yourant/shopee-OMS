<template>
  <el-dialog
    :title="operation === 'add' ? '添加站点' : '编辑站点'"
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
          label="站点名称"
          prop="site_code"
        >
          <el-input
            style="width: 90%"
            v-model="form.site_code"
            clearable
            placeholder="请输入站点名称"
          />
        </el-form-item>
        <el-form-item
          label="站点描述"
          prop="description"
        >
          <el-input
            style="width: 90%"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8}"
            v-model="form.description"
          />
        </el-form-item>
        <el-form-item
          label="站点URL"
          prop="domain"
        >
          <el-input
            style="width: 90%"
            v-model="form.domain"
            clearable
            placeholder="请输入站点URL"
          />
        </el-form-item>
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
  import { addSite, editSite } from '@/api/site'

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
            site_code: '',
            description: '',
            domain: ''
          }
        }
      },
      operation: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        options: [],
        rules: {
          site_code: [
            { required: true, message: '请输入站点名称', trigger: ['blur', 'change'] },
            { min: 1, max: 10, message: '最大长度为10个字符', trigger: 'blur' }
          ],
          description: [
            { min: 0, max: 30, message: '最大长度为30个字符', trigger: ['blur', 'change'] }
          ],
          domain: [
            { required: true, message: '请输入站点URL', trigger: 'blur' },
            { pattern: /(^http:\/\/)|(^https:\/\/)/, message: '请输入正确的站点URL（http://... 或者 https://...）', trigger: 'blur' }
          ]
        },
        form: {},
        loading: false,
        initData: {}
      }
    },
    created() {
    },
    methods: {
      addSite(form) {
        this.$refs[form].validate((valid) => {
          if (valid) {
            this.loading = true
            const form = {
              site_code: this.form.site_code,
              domain: this.form.domain,
              description: this.form.description
            }
            if (this.operation === 'add') {
              form.create_user_id = store.getters.userInfo.id
              addSite(form).then(response => {
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
                form.update_user_id = store.getters.userInfo.id
                form.id = this.form.id
                editSite(form).then(response => {
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
  }
</style>
