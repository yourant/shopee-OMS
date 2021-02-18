<template>
  <el-dialog
    title="关注粉丝"
    class="dialog-add-upload-plan"
    :visible="open"
    top="8vh"
    :before-close="onClose"
    width="850px"
  >
    <template>
      <el-row>
        <el-form
          ref="listQuery"
          :inline="true"
          :model="listQuery"
          class="demo-form-inline"
          size="mini"
        >
          <h2>当前账户</h2>
          <el-col :span="12">
            <el-form-item
              label="站点"
              prop="site_code"
            >
              <el-select
                v-model="listQuery.site_code"
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
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="账户"
              prop="site_code"
            >
              <el-select
                v-model="listQuery.account"
                clearable
                placeholder="选择账户"
              >
                <el-option
                  v-for="(item, index) in siteCode"
                  :label="item"
                  :value="item"
                  :key="index"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <el-row>
        <h2>账户粉丝</h2>
        <el-col :span="24">
          <div class="fem">
            <svg-icon
              class="my_account fem-item"
              icon-class="my-account"
            />
            <div
              class="fem-item title"
              style="margin-left: 20px"
            >
              我的关注
            </div>
            <div
              class="fem-item title"
              style="margin-left: 25px"
            >
              {{ fenLength }}
            </div>
            <el-button
              class="fem-item"
              style="margin-left: 25px"
              size="mini"
              type="success"
              @click="upCancel('formData')"
            >
              全部取关
            </el-button>
          </div>
        </el-col>
      </el-row>
      <el-row style="margin-top: 15px">
        <el-col :span="12">
          <div class="fems">
            <div class="title">
              店铺粉丝
            </div>
            <div class="list-box">
              <div>
                <div>店铺</div>
                <el-input
                  type="text"
                  v-model="input1"
                />
                <el-button
                  class="fem-item"
                  style="margin-left: 25px"
                  size="mini"
                  type="success"
                  @click="upCancel('formData')"
                >
                  获取粉丝
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="fems">
            <div class="title">
              我的粉丝库
            </div>
            <div class="list-box" />
          </div>
        </el-col>
      </el-row>
    </template>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="onCancel('formData')"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    props: {
      open: {
        type: Boolean,
        default: false
      },
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        options: [],
        listQuery: {
          account: undefined,
          site_code: undefined
        },
        siteCode: [],
        fenLength: 5000
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
      closeClearForm() {
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      upCancel() {
        alert()
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
  .dialog-add-upload-plan{
    h2 {
      font-size: 14px;
      &::before {
        content: "1";
        background: #41a1ff;
        color: transparent;
        margin-right: 10px;
      }
    }
    .fem{
      height: 72px;
      padding: 15px;
      background-color: #f2f2f2;
      .fem-item{
        float: left;
      }
      .my_account{
        font-size: 32px;
        color: #00bfa5;
      }
      .title{
        display: inline-block;
        height: 32px;
        line-height: 32px;
      }
    }
    .fems{
      height: 336px;
      .title{
        text-align: center;
        color: #333333;
        font-size: 14px;
      }
      .list-box{

        width: 80%;
        margin: 0 auto;
        height: 180px;
        background-color: #4dbeff;
      }
    }
  }
</style>
