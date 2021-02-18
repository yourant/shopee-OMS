<template>
  <el-dialog
    title="批量采集店铺粉丝"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form
        ref="formData"
        :model="formData"
        label-width="130px"
        size="small"
        @submit.native.prevent
        v-loading="dialogLoading"
        element-loading-text="店铺URL信息验证中"
      >
        <el-form-item
          prop="item_line"
          label="产品线"
          :rules="[ { required: true, validator: productRule, trigger: ['change'] } ]"
        >
          <el-select
            v-model="formData.item_line"
            clearable
            multiple
            filterable
            placeholder="选择产品线"
            style="width: 400px;"
          >
            <el-option
              v-for="(item, index) in productLine"
              :label="item.name"
              :value="item.id"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="(domain, index) in formData.domains"
          :label="'店铺' + parseInt(index + 1) "
          :key="domain.key"
          :prop="'domains.' + index "
          :rules="[ { required: true, validator: rule, trigger: 'blur' } ]"
          :ref="domain + index"
        >
          <el-input
            v-model="domain.value"
            style="width: 400px;"
            clearable
            @clear="clearInput(index)"
            @blur="blurInput"
            placeholder="请输入shopee店铺地址"
          />
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            circle
            v-if="index === formData.domains.length - 1 && formData.domains.length < 10"
            @click="addStore"
          />
          <el-button
            type="primary"
            plain
            icon="el-icon-minus"
            circle
            v-show="formData.domains.length > 1"
            @click.prevent="removeDomain(index)"
          />
        </el-form-item>
      </el-form>
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="onCancel"
        :disabled="dialogLoading"
      >
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="SubmitDomain"
        :disabled="dialogLoading"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { fetchCollectorFans } from '@/api/fans'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      productLine: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        formData: {
          item_line: [],
          domains: [
            {
              key: Date.now(),
              value: ''
            }
          ]
        },
        dialogLoading: false,
        errorArr: {},
        rule: (rule, value, callback) => {
          const index = this.formData.domains.indexOf(value)
          if (this._.trim(value.value)) {
            const regDomain = /^https?:\/\/shopee./
            if (regDomain.test(value.value)) {
              if (this.formData.domains.length > 1) {
                let count = 0
                this.formData.domains.forEach(item => {
                  if (item.value === value.value) {
                    ++count
                  }
                })
                if (count > 1) {
                  callback(new Error('店铺地址重复'))
                }
              }
              callback()
            } else {
              callback(new Error('请输入https://shopee或https://shopee开头的正确店铺地址'))
            }
          } else {
            callback(new Error('店铺地址不能全为空格或者为空'))
            this.formData.domains[index].value = ''
          }
        },
        productRule: (rule, value, callback) => {
          if (value.length === 0) {
            callback(new Error('产品线不能为空'))
          }
          callback()
        }
      }
    },
    created() {
    },
    methods: {
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      // dialog 关闭
      closeClearForm() {
        this.$refs.formData.resetFields()
        this.formData = {
          item_line: [],
          domains: [
            {
              key: Date.now(),
              value: ''
            }
          ]
        }
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      // 删除 URL
      removeDomain(index) {
        this.formData.domains.splice(index, 1)
      },
      // input clear
      clearInput(index) {
        this.$refs.formData.clearValidate('domains.' + index)
      },
      // 增加店铺URL
      addStore() {
        this.formData.domains.push({
          key: Date.now(),
          value: ''
        })
      },
      // 增加domain or 提交
      SubmitDomain() {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.dialogLoading = true
            // 保存
            const shop_url = []
            this.formData.domains.map(item => {
              shop_url.push(item.value)
            })
            const item_line_name = []
            this.productLine.forEach(item => {
              if (this.formData.item_line.indexOf(item.id) > -1) {
                item_line_name.push(item.name)
              }
            })
            const params = {
              item_line: this.formData.item_line.toString(),
              item_line_name: item_line_name.toString(),
              shop_url: shop_url,
              create_user_id: store.getters.userInfo.id
            }
            fetchCollectorFans(params).then(response => {
              this.closeClearForm()
              this.$emit('reload')
            }).finally(_ => {
              this.dialogLoading = false
            })
          }
        })
      },
      blurInput() {
        this.$refs.formData.validate()
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
