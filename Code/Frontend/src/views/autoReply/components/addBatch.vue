<template>
  <el-dialog
    title="批量添加自动回复"
    class="dialog-add-upload-plan auto_reply"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <div v-loading="dialogLoading">
      <el-form
        ref="formData"
        :model="formData"
        size="small"
        @submit.native.prevent
      >
        <el-form-item label="模板" label-width="130px" style="margin-bottom: 10px">
          <div class="faq">
            <div v-for="(item, index) in formData.data"
                 :key="index"
            >
              <el-col :span="18">
                <el-card class="box-card" :title="'关键字' + (index+1) + '：'+ item.key"
                         :name="index + 1"
                >
                  <el-form :ref="'faq'+ index" :model="item" size="small" class="faq-item">
                    <el-form-item label="关键字" label-width="80px" prop="key"
                                  :rules="[
                                    { required: true, trigger: 'blur', message: '请输入关键字' },
                                    { validator: rule, trigger: 'blur' }
                                  ]"
                    >
                      <el-input type="text" @blur="checkValidate" v-model="item.key" placeholder="请输入关键字" />
                    </el-form-item>
                    <el-form-item label="回复内容" label-width="80px" prop="answer"
                                  :rules="[
                                    { required: true, trigger: 'blur', message: '请输入回复内容' },
                                    { validator: answerRule, trigger: 'blur' }
                                  ]"
                    >
                      <el-input type="textarea" v-model="item.answer" placeholder="请输入回复内容" />
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              <el-col :span="4" style="margin-top:5px;margin-left:10px">
                <el-button
                  type="primary"
                  plain
                  v-if="index === formData.data.length - 1"
                  icon="el-icon-plus"
                  style="float: left; padding: 5px;margin-right:2px"
                  circle
                  @click="addBatch"
                />
                <el-button
                  type="primary"
                  style="float: left; padding: 5px;margin-right:2px"
                  plain
                  icon="el-icon-minus"
                  circle
                  v-show="formData.data.length > 1"
                  @click.prevent="handleRemoveItem(index)"
                />
              </el-col>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel" :disabled="dialogLoading">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="dialogLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { apiReplyAdd } from '@/api/chat'
  import { mapGetters } from 'vuex'
  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        formData: {
          data: [
            {
              key: '',
              answer: ''
            }
          ]
        },
        dialogLoading: false,
        activeNames: [1, 2, 3],
        errorArr: {},
        rule: (rule, value, callback) => {
          if (this._.trim(value)) {
            const filterList = this._.filter(this.formData.data, v => {
              return this._.toUpper(this._.trim(v.key)) === this._.toUpper(this._.trim(value))
            })
            if (filterList.length > 1) {
              callback(new Error('该关键字已存在，不可重复添加'))
            }
            if (value.length > 100) {
              callback(new Error('最大100个字符'))
            }
            if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(value)) {
              callback(new Error('关键字存在违禁字符'))
            }
          } else {
            callback(new Error('请输入关键字'))
          }
          callback()
        },
        answerRule: (rule, value, callback) => {
          if (this._.trim(value)) {
            if (value.length > 200) {
              callback(new Error('最大200个字符'))
            }
          } else {
            callback(new Error('请输入回复内容'))
          }
          callback()
        }
      }
    },
    computed: {
      allRefs() {
        const arr = []
        this._.forEach(this.formData.data, (v, i) => {
          arr.push('faq' + i)
        })
        return arr
      },
      ...mapGetters([
        'userInfo'
      ])
    },
    created() {},
    methods: {
      handleChange(val) {
      // console.log(val)
      },
      addBatch() {
        if (this.formData.data.length >= 10) {
          this.$message.error('批量添加最多一次性可添加10条问题')
          return
        }
        this.formData.data.push({
          key: '',
          answer: ''
        })
        this.activeNames.push(this.formData.data.length)
      // this.$nextTick(() => {
      //   document.querySelector('.faq').scrollTop = 10000
      // })
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      // dialog 关闭
      closeClearForm() {
        this.$emit('update:open', false)
        this.resetFields()
        this.initData()
      },
      initData() {
        this.formData = {
          data: [
            {
              key: '',
              answer: ''
            }
          ]
        }
        this.activeNames = [1, 2, 3]
      },
      // 批量添加
      handleSubmit() {
        this.checkValidate()
        this.$refs['formData'].validate(valid => {
          if (valid) {
            if (!this.checkValidate()) {
              return
            }
            if (!this.allRefs.length) {
              this.$message.error('无数据')
              return
            }
            const data = this.createSubmitData()
            this.dialogLoading = true
            apiReplyAdd(data).then(res => {
              this.closeClearForm()
              this.$emit('reload')
              let msg = '<div style="max-height: 700px;padding-left:20px">'
              this._.forEach(res.data.success, v => {
                msg += `<div style="color: green">关键字：<span style="font-weight: bold">“${v}“</span>  添加成功</div>`
              })
              this._.forEach(res.data.repeat, v => {
                msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${v}“</span> 重复，添加失败</div>`
              })
              this._.forEach(res.data.error, v => {
                msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${v}“</span>  添加失败</div>`
              })
              this._.forEach(res.data.no_plain_text, v => {
                msg += `<div style="color: red">关键字：<span style="font-weight: bold">“${v}“</span>  存在违禁字符</div>`
              })
              msg += '</div>'
              this.$alert(msg, '提示', {
                dangerouslyUseHTMLString: true
              })
              this.dialogLoading = false
            }).catch((err) => {
              this.$message.error(typeof err === 'string' ? err : '添加失败')
              this.dialogLoading = false
            })
          }
        })
      },
      createSubmitData() {
        const data = {
          data: this.formData.data,
          create_user_id: this.userInfo.id,
          create_user: this.userInfo.name,
          not_show_message: true
        }
        data.data = this._.map(data.data, v => {
          return {
            key: this._.trim(v.key),
            answer: this._.trim(v.answer)
          }
        })
        return data
      },
      checkValidate() {
        let flag = true
        this._.forEach(this.allRefs, v => {
          this.$refs[v][0].validate(valid => {
            if (!valid) {
              flag = false
            }
          })
        })
        return flag
      },
      resetFields() {
        this._.forEach(this.allRefs, v => {
          this.$refs[v][0].resetFields()
        })
        this.$refs.formData.resetFields()
      },
      handleRemoveItem(index) {
        this.formData.data.splice(index, 1)
        this.$forceUpdate()
        this.$nextTick(() => {
          this.checkValidate()
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-form-item {
  p {
    margin: 0;
    color: #f56c6c;
    font-size: 12px;
  }
}
.box-card {
  margin-bottom: 20px;
}
.faq {
  height: 490px;
  overflow: auto;
  margin-top: 10px;
  //滚动条凹槽的颜色，还可以设置边框属性
  &::-webkit-scrollbar-track-piece {
    background-color: #f8f8f8;
  }
  //滚动条的宽度
  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
  //滚动条的设置
  &::-webkit-scrollbar-thumb {
    background-color: #dddddd;
    background-clip: padding-box;
    min-height: 28px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #bbb;
  }
  .faq-item {
    padding: 10px 0 0;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.auto_reply .el-dialog__body {
  padding-bottom: 20px;
}
.auto_reply {
  .el-card__header {
    padding: 5px 20px;
  }
  .card-title {
    height: 0;
    line-height: 0;
  }
  .el-card.is-always-shadow {
    box-shadow: unset;
  }
  .el-card__body {
    padding: 10px;
  }
}

.faq {
  .el-collapse {
    border-top: 0;
  }
  .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-weight: 600;
    background-color: #dcdfe6;
    border-bottom: 1px solid #409eff;
    padding-left: 8px;
  }
  .el-collapse-item__header.is-active {
    border-bottom-color: transparent;
  }
  .el-collapse-item__content {
    padding-bottom: 0;
  }
  .el-collapse-item__wrap {
    border-bottom: 0 !important;
  }
}
</style>
