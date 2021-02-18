<template>
  <el-dialog
    title="订单备注"
    :visible="open"
    :before-close="closeClearForm"
    width="470px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <div>
        <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 5 }" v-model="note" class="note-input" maxlength="200" placeholder="买家将不会看到您的备注信息"></el-input>
        <div style="text-align: right">{{ `${note.length}/200` }}</div>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="confirmAdd">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import { editOrderNote } from '@/api/chat'

  export default {
    data() {
      return {
        note: '',
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
        if(this.note.trim()) {
          params.data.note = this.note
          editOrderNote(params).then(() => {
            this.closeClearForm()
            this.$emit('refreshOrderList')
          })
        } else if (!this.note.trim() && this.orderInfo.seller_note) {
          editOrderNote(params).then(() => {
            this.closeClearForm()
            this.$emit('refreshOrderList')
          })
        } else {
          this.closeClearForm()
        }
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
        this.note = ''
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.note = this.orderInfo.seller_note || ''
        }
      }
    }
  }
</script>
