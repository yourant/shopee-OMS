<template>
  <div
    style="min-width:1200px;min-height:400px"
    class="chat-list-page"
    v-loading="aside_loading"
  >
    <el-tabs
      v-if="refreshTabs"
      v-model="activeTag"
      type="card"
      :before-leave="beforeLeave"
      @tab-click="tabChange"
    >
      <el-tab-pane
        :lazy="true"
        v-for="(item, index) in accountListFormated"
        :disabled="changeTabCooling && activeTag !== item.account || item.active === '0'"
        :key="index"
        :label="item.account"
        :name="item.account"
      >
        <div slot="label" :class="item.active ==='0' && item.disabledShow ? 'disabled-tab-wrap' : ''" @mouseover.stop="accountHover(item, true)" @mouseleave.stop="accountHover(item, false)">
          <el-tooltip v-if="item.active==='0'" class="item" effect="dark" content="此账号已禁用" placement="top-start">
            <span>
              <svg-icon icon-class="wrong" v-if="item.active==='0' && item.disabledShow" class="disabled-icon"/>
              <span style="display:inline-block;height:32px">{{ item.account }}</span>
            </span>
          </el-tooltip>
          <span v-else>{{ item.account }}<span v-if="item.isNotice" class="is-notice" >●</span></span>
          <svg-icon icon-class="top-account" v-if="!!Number(item.stick)" class="is-top-account"></svg-icon>
          <svg-icon icon-class="perfect" v-if="item.is_excellent === '1'" style="margin-right: 5px;"></svg-icon>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- <el-form :inline="true" :model="formData" size="small" class="demo-form-inline">
        <el-form-item label="站点账号">
          <el-cascader
            :disabled="aside_loading"
            v-model="formData.account"
            placeholder="试试搜索"
            clearable
            :options="options_account"
            filterable
            @change="fetchAccountInfo"
            :props="props"
          ></el-cascader>
        </el-form-item>
      </el-form> -->
    <div class="content-box">
      <div
        v-for="(item, index) in accountListFormated"
        :key="index"
      >
        <conversations
          v-if="item.account === activeTag"
          :site-data="item"
          :active-tag="activeTag"
          @sortTabList="handleCustomTop"
        />
      </div>
      <div
        v-if="noData"
        class="no-account-box"
      >
        <svg-icon icon-class="remind" /> 当前用户下没有账号，请先配置账号
      </div>
    </div>
  </div>
</template>

<script>
  import { fetchAccountList } from '@/api/chat'
  import { mapGetters } from 'vuex'
  import conversations from './conversations'
  export default {
    name: 'List',
    components: { conversations },
    data() {
      return {
        refreshTabs: true,
        activeTag: '',
        searchInput: '',
        debounceLiClick: true,
        platFormList: {
          'my': 'https://seller.shopee.com.my',
          'sg': 'https://seller.shopee.sg',
          'ph': 'https://seller.shopee.ph',
          'id': 'https://seller.shopee.co.id',
          'th': 'https://seller.shopee.co.th',
          'vn': 'https://banhang.shopee.vn',
          'tw': 'https://seller.shopee.tw'
        },
        aside_loading: false,
        user_id: this.$store.getters.userInfo.id,
        options_account: [
          {
            value: 'zhinan',
            label: '暂无数据',
            disabled: true
          }
        ],
        props: {
          label: 'account',
          value: 'id',
          children: 'child'
        },
        accountInfo: this.$store.getters.accountInfo,
        noData: false,
        changeTabCooling: false,
        accountListFormated: []
      }
    },
    computed: {
      ...mapGetters([
        'activeAccount',
        'noticeAccount'
      ])
    },
    created() {
      this.$store.commit('platform/SET_INFO', '')
      // 重置504提示状态
      this.$store.commit('chat/SET_ERROR_TIP',false)
      this.fetchAccountList()
    },
    mounted() {
    },
    methods: {
      // 置顶账户操作，置顶操作放最前取消置顶放最后
      handleCustomTop(val) {
        const exceptlist = this._.cloneDeep(this.accountListFormated).filter(v => v.id !== val.id)
        // 置顶
        if (!!Number(val.stick)) {
          exceptlist.unshift(val)
        } else {
          exceptlist.push(val)
        }
        this.refreshTabs = false
        this.accountListFormated = []
        this.accountListFormated = exceptlist
        this.$nextTick(() => {
          this.refreshTabs = true
        })
      },
      accountHover(item, type) {
        item.disabledShow = type
        this.$forceUpdate()
      },
      tabChange() {
        // 切换账号时去除当前红点
        this._.forEach(this.accountListFormated, v => {
          if (v.account === this.activeTag) {
            v.isNotice = false
          }
        })
        this.checkTopNotice()
        // 切换账号时重置504状态
        this.$store.commit('chat/SET_ERROR_TIP',false)
      },
      // 当红点都消失时顶部提示不闪烁
      checkTopNotice() {
        const isNoticeList = this._.filter(this.accountListFormated, v => {
          return v.isNotice
        })
        this.$store.commit('chat/SET_NOTICE_SHOW', !!isNoticeList.length)
      },
      cloneDeep(data) {
        const obj = this._.cloneDeep(this[data])
        this[data] = []
        this[data] = obj
      },
      createAccountList() {
        const arr = []
        this._.forEach(this.options_account, v => {
          this._.forEach(v.child, v1 => {
            arr.push(v1)
          })
        })
        this._.forEach(arr, v => {
          if (v.active !== '0' && this.activeTag === '0') {
            this.activeTag = v.account
          }
        })
        this._.forEach(arr, (v) => {
          v.isNotice = false
        })
        this.$forceUpdate()
        return arr
      },
      beforeLeave(newTab, oldTab) {
        if (!oldTab) {
          return true
        }
        if (!this.changeTabCooling) {
          this.changeTabCooling = true
          setTimeout(() => {
            this.changeTabCooling = false
          }, 3000)
          return true
        } else {
          return false
        }
      },
      /* 获取当前用户下站点账户列表 */
      fetchAccountList() {
        const params = {
          user_id: this.user_id,
          // user_id: 1,
          not_show_message: true
        }
        this.aside_loading = true
        fetchAccountList(params).then(response => {
          const { data } = response
          this.options_account = data || []
          this.noData = Boolean(!this.options_account.length)
          this.aside_loading = false
          this.accountListFormated = this.createAccountList()
          // 判断是否通知消息查看详情 由 store 取值后赋值为空
          if (this.activeAccount.length) {
            this._.forEach(this.accountListFormated, v => {
              // 禁用状态图标展示
              v.disabledShow = false
              if (v.site_code === this.activeAccount[0] && v.id === this.activeAccount[1]) {
                this.activeTag = v.account
              }
            })
          }
          this.cloneDeep('accountListFormated')
          this.formatAccountNotice()
          this.$store.commit('chat/SET_ACTIVE_ACCOUNT', [])
        }).catch(() => { this.aside_loading = false })
      },
      // 账号消息红点展示
      formatAccountNotice() {
        this._.forEach(this.accountListFormated, v => {
          const isNotice = this._.filter(this.noticeAccount, v1 => {
            return v1.account_id === v.id
          })
          v.isNotice = !!isNotice.length
          if (v.account === this.activeTag) {
            v.isNotice = false
          }
        })
        // const cloneTag = this.activeTag
        // this.activeTag = ''
        // this.$nextTick(() => {
        //   this.activeTag = cloneTag
        // })
      }
    },
    watch: {
      noticeAccount: {
        deep: true,
        handler(val) {
          this.formatAccountNotice()
        }
      }
    },
    filters: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.disabled-tab-wrap {
  position: relative;
  text-align: center;
  background: rgba(0,0,0,0.1);
  width: calc(100% + 20px);
  transform: translateX(-10px);
}
.disabled-icon {
  position: absolute;
  font-size: 25px;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  color: red !important;
  transition: all 0.3s ease;
}
.no-account-box {
  margin-top: 160px;
  text-align: center;
  font-size: 20px;
}
  .svg-icon {
    color: #ff6600;
  }
  .is-notice {
    position: absolute;
    right: 1px;
    top: -10px;
    color: red;
    height: 20px;
    font-size: 20px;
  }
  .is-top-account {
    position: absolute;
    left: 1px;
    top: -2px;
    font-size: 14px;
  }
</style>
