<template>
  <el-dialog
    title="评价买家"
    :visible="open"
    :before-close="closeClearForm"
    width="470px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <el-form size="small flex-form">
        <el-form-item label="评分">
          <el-rate
            v-model="rate_star"
            score-template="{value}"
          ></el-rate>
        </el-form-item>
        <el-form-item label="评论">
          <div style="position: relative;">
            <el-input style="width:350px;" type="textarea" :autosize="{ minRows: 5, maxRows: 5 }" v-model="rate_comment" class="note-input" maxlength="500"></el-input>
            <span style="text-align: right">{{ `${rate_comment.length}/200` }}</span>
          </div>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="confirmAdd">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import { rateCustomComment } from '@/api/chat'

  export default {
    data() {
      return {
        rate_comment: '',
        rate_star: 5
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      },
      orderInfo: {
        type: Object,
        default: () => {
        }
      }
    },
    methods: {
      // 添加计划
      confirmAdd() {
        const params = this.createAddParam()
        params.data.rate_star = this.rate_star
        if(this.rate_comment.trim()) {
          params.data.rate_comment = this.rate_comment
        }
        rateCustomComment(params).then(() => {
          this.closeClearForm()
          this.$emit('refreshOrderList')
        })
      },
      createAddParam() {
        return {
          platform: this.orderInfo.platform,
          cookie: this.orderInfo.cookie,
          authorization: this.orderInfo.authorization,
          data: {
            order_id: this.orderInfo.id,
            shop_id: this.orderInfo.shop_id,
            _uid: this.orderInfo.data._uid,
            buyer_id: this.orderInfo.buyer_id
          }
        }
      },
      // 关闭弹窗，清除内容
      closeClearForm() {
        this.rate_comment = ''
        this.rate_star = 5
        this.$emit('update:open', false)
      }
    }
  }
</script>
<style lang="scss" scoped>
  .flex-form{
    display: flex;
    .el-rate{
      margin-top: 6px;
    }
  }
</style>
