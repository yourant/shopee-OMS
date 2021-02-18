<template>
  <el-dialog
    title="编辑自动回复"
    class="dialog-add-upload-plan auto_reply"
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
        size="small"
        label-width="130px"
        v-loading="dialogLoading"
        :rules="rule"
      >
        <el-form-item label="关键字" style="margin-bottom: 30px" prop="key">
          <el-input type="text" v-model="formData.key" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="回复内容" prop="answer">
          <el-input type="textarea" v-model="formData.answer" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel" :disabled="dialogLoading">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="dialogLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { apiReplyEdit } from '@/api/chat'

export default {
  props: {
    open: Boolean,
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const checkKey = (rule,value,callback) => {
      if(!value.trim()) {
        callback(new Error('请输入关键字'))
      }
      if(value.trim().length>100) {
        callback(new Error('最多输入100个字符'))
      }
      if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(value)) {
        callback(new Error('关键字存在违禁字符'))
      }
      callback()
    }
    return {
      formData: {
        id: undefined,
        key: undefined,
        answer: undefined
      },
      dialogLoading: false,
      rule: {
        key: [
          { required: true, validator: checkKey, trigger: ['change', 'blur'] }
        ],
        answer: [
          { required: true, message: '请输入回复内容' },
          { max: 200, message: '最大200个字符' }
        ]
      }
    }
  },
  created() {},
  methods: {
    handleChange(val) {
      console.log(val)
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    // dialog 关闭
    closeClearForm() {
      this.initData()
      this.$refs.formData.resetFields()
      this.$emit('update:open', false)
    },
    initData() {
      this.formData = {
        key: undefined,
        answer: undefined
      }
    },
    // 编辑自动回复
    handleSubmit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          this.dialogLoading = true
          const data = this.createSubmitData()
          apiReplyEdit(data)
            .then(response => {
              this.closeClearForm()
              this.$emit('reload')
              this.dialogLoading = false
            })
            .catch(_ => {
              this.dialogLoading = false
            })
        }
      })
    },
    createSubmitData() {
      const { id, key, answer } = this.formData
      const data = {
        id,
        key: this._.trim(key),
        answer: this._.trim(answer),
        update_user_id: this.$store.getters.userInfo.id,
        update_user: this.$store.getters.userInfo.name
      }
      return data
    }
  },
  watch: {
    open: {
      handler(val) {
        if (val) {
          this.formData = this._.cloneDeep(this.data)
        }
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

</style>
