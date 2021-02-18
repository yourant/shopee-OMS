<template>
  <el-dialog
    title="快捷回复管理"
    class="dialog-limit-height-has-btn auto_reply"
    :visible="open"
    :before-close="onClose"
    :lock-scroll="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    min-height="600px"
    width="740px"
  >
    <div v-loading="listLoading">
      <div ref="dialog-body">
        <div id="dialog-body">
          <div class="reply-item div-flex" v-for="(item,index) in list" :key="index">
            <el-input type="textarea" :autosize="{minRows: 2, maxRows: 6}" v-model="item.message" style="width:70%;"></el-input>
            <div>
              <el-button size="mini" type="primary" @click="updateReply(item)">保存</el-button>
              <el-button size="mini" type="danger" @click="deleteReply(item)">删除</el-button>
            </div>
          </div>
          <el-button size="mini" type="primary">新增</el-button>
          <div class="div-flex" id="dialog-reply">
            <el-input type="textarea" :autosize="{minRows: 2, maxRows: 6}" v-model="add_reply_content" style="width:70%;"></el-input>
            <div>
              <el-button size="mini" type="primary" @click="addReply">添加</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { getReplyList, addFastReply, updateFastReply, deleteFastReply } from '@/api/chat'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      replyList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        list: [],
        add_reply_content: '',
        listLoading: false,
        accountInfo: this.$store.getters.accountInfo,
        showList: true,
      }
    },
    methods: {
      refreshList(val) {
        this.listLoading = true
        getReplyList(this.$store.getters.accountInfo.id).then(res => {
          this.list = res.data
          this.listLoading = false
          this.$nextTick(() => {
            document.querySelector('#dialog-body').scrollTop = val
          })
        })
      },
      updateReply(item) {
        updateFastReply({ id: item.id, message: item.message, user_id: this.$store.getters.userInfo.id }).then(() => {
          this.refreshList()
        })
      },
      deleteReply(item) {
        deleteFastReply({ id: item.id }).then(() => {
          this.refreshList()
        })
      },
      addReply() {
        if (this.add_reply_content.trim()) {
          addFastReply({ account_id: this.$store.getters.accountInfo.id, user_id: this.$store.getters.userInfo.id, message: this.add_reply_content }).then(() => {
            this.add_reply_content = ''
            this.refreshList(10000)
          })
        } else {
          this.$message.error('快捷回复内容不能为空！')
        }

      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.show_add = false
        this.$emit('update:replyList', [])
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.refreshList(0)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .div-flex {
    display: flex;
    margin: 10px 0;
    padding-right: 20px;
    justify-content: space-between;
  }

  .div-add {
    border-bottom: 1px solid #d3dce6
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .auto_reply .el-dialog__body {
    overflow: hidden;
    padding-bottom: 20px;
  }

  /* 带底部按钮弹窗 */
  /*.dialog-limit-height-has-btn {*/
    /*.el-dialog {*/
      /*margin-top: 10vh !important;*/
      /*height: 80%;*/
    /*}*/
    /*.el-dialog__body {*/
      /*height: calc(100% - 40px);*/
      /*overflow: hidden;*/
    /*}*/
  /*}*/

  #dialog-body{
    max-height:600px;
    overflow: auto;
  }

  /* 不带底部按钮弹窗 */
  /*.dialog-limit-height,*/
  /*.dialog-edit-user-roles {*/
    /*.el-dialog {*/
      /*height: 74%;*/
    /*}*/
  /*}*/
</style>
