<template>
  <el-dialog
    title="任务添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="onClose"
    width="740px"
  >
    <div v-loading="loading" element-loading-text="加载中">
      <template>
        <el-form ref="formData" :model="formData" :rules="rules" label-width="60px" size="small" @submit.native.prevent>
          <el-form-item label="时间" prop="time">
            <el-select v-model="timeType" size="mini" style="width:100px;" @change="timeSelectChange">
              <el-option label="按日" value="date"></el-option>
              <el-option label="按周" value="week"></el-option>
              <el-option label="按月" value="month"></el-option>
            </el-select>
            <el-date-picker
              size="mini"
              v-model="formData.time"
              placeholder="请选择"
              :type="timeType"
              :format="formatShow"
              :picker-options="pickerOptions"
              @change="selectTime"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="账号" prop="account_id">
            <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onCancel" size="mini">取 消</el-button>
        <el-button type="primary" @click="addPlan('formData')" size="mini">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { getAllAccount, addPerformanceTask } from '@/api/chat'
import multipleSelectAccount from '@/views/autoReply/tools/components/multipleSelectAccount'

export default {
  components: { multipleSelectAccount },
  data() {
    const checkTime = (rule, value, callback) => {
      if (!this.formData.start_time) {
        return callback(new Error('请选择时间'))
      }
      callback()
    }
    return {
      pickerOptions: {
        'firstDayOfWeek': 1,
        disabledDate(time) {
          //限制按日选择时间不能选择当天或以后
          return time.getTime() > Date.now() - 8.64e7
        }
      },
      timeType: 'date',
      formatShow: 'yyyy-MM-dd',
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      loading: false,
      formData: {
        time: undefined,
        schedule_type: 1,
        account_id: [],
        user_name: this.$store.state.user.name,
        start_time: '',
        end_time: ''
      },
      siteOptions: [],
      rules: {
        time: [{ required: true, validator: checkTime, trigger: 'change' }]
      },
      isIndeterminate: true,
      /* 获取所有筛选条件 */
      selectOptions: ['LinioAdvtAccount']
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  created() {
    this.searchInit()
  },
  methods: {
    selectTime() {
      if (this.formData.time) {
        const val = this.formData.time
        // date类型
        if (this.timeType === 'date') {
          this.formData.start_time = (new Date(val).getTime()) / 1000
          this.formData.end_time = (new Date(val).getTime() + 86400000) / 1000
        }
        // week类型
        if (this.timeType === 'week') {
          this.formData.start_time = (new Date(val).getTime() - 8.64e7) / 1000
          this.formData.end_time = (new Date(val).getTime() + 86400000 * 6) / 1000
        }
        // month类型
        if (this.timeType === 'month') {
          const year = new Date(this.formData.time).getFullYear()
          const month = new Date(this.formData.time).getMonth() + 1
          const days = this.$moment(`${ year }-${ month }`, 'YYYY-MM').daysInMonth()
          this.formData.start_time = (new Date(val).getTime()) / 1000
          this.formData.end_time = (new Date(val).getTime() + 86400000 * days) / 1000
        }
        // 开始时间小于当前时间且结束时间大于当前时间，结束时间为当前日0点
        if (new Date(this.formData.end_time * 1000).getTime() > new Date().getTime()) {
          this.formData.end_time = new Date((this.$moment(new Date()).format('YYYY-MM-DD')) + ' 00:00:00').getTime() / 1000
        }
        this.formData.start_time = this.$moment(this.formData.start_time * 1000).format('YYYY-MM-DD HH:mm:ss')
        this.formData.end_time = this.$moment(this.formData.end_time * 1000).format('YYYY-MM-DD HH:mm:ss')
      } else {
        this.formData.start_time = ''
        this.formData.end_time = ''
      }
    },
    timeSelectChange(val) {
      if (val) {
        this.timeType = val
        if (val === 'date') {
          this.formatShow = 'yyyy-MM-dd'
        }
        if (val === 'week') {
          this.formatShow = 'yyyy 第 WW 周'
        }
        if (val === 'month') {
          this.formatShow = 'yyyy-MM'
        }
        console.log(this.formatShow)
        this.formData.time = undefined
      }
    },
    searchInit() {
      getAllAccount().then(res => {
        this.multipleSelectAccountOption.accountArr = res.data
      })
    },
    selectAccount(arr) {
      this.formData.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs['formData'].clearValidate()
    },
    cleanSelect() {
      this.$refs['formData'].resetFields()
    },
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const obj = {
            user_id: this.$store.getters.userInfo.id,
            user_name: this.$store.getters.userInfo.name,
            schedule_type: 1,
            statistics_type: this.timeType === 'date' ? 'day' : this.timeType,
            start_time: this.formData.start_time,
            end_time: this.formData.end_time
          }
          if (this.formData.account_id.length) {
            obj.account_id = this.formData.account_id.join(',')
          }
          this.loading = true
          addPerformanceTask(obj).then(() => {
            this.loading = false
            this.closeClearForm()
            this.$emit('reload')
          }).catch(e => {
            this.loading = false
          })
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
      this.$refs['formData'].resetFields()
      this.clearAccount()
      this.$emit('update:open', false)
    }
  },
  watch: {
    open(val) {
      if (val) {
        if (this.$refs['formData']) {
          this.$refs['formData'].clearValidate()
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
<style rel="stylesheet/scss" lang="scss">
.dialog-add-upload-plan {
  .el-dialog__body {
    padding-bottom: 0 !important;
  }

  .dialog-footer {
    margin-bottom: 15px;
    text-align: right;
  }
}
</style>
