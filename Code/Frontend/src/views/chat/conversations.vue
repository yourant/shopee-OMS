<template>
  <div class="conversations-page">
    <div class="header-box" style="margin-bottom: -1px">
      <el-row class="left-row">
        <el-button v-if="conversationsList.length || searchData.length" size="mini" type="primary" @click="jumpToLoginSeller">卖家后台登录</el-button>
      </el-row>
      <el-row class="right-row">
        <span style="font-size:14px">退款/退货 （{{ orderStatusCountObj.refoundCount }}）</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="font-size:14px">取消 （{{ orderStatusCountObj.cancelCount }}）</span>
        <el-button type="primary" size="mini" @click="openTheNewTAB(platFormList[siteCodeName])">查看详情</el-button>
        <el-button type="success" v-if="Number(siteData.stick) === 0" size="mini" @click="handleTopAccount('1')">置顶</el-button>
        <el-button type="danger" v-else size="mini" @click="handleTopAccount('0')">取消置顶</el-button>
      </el-row>
    </div>
    <el-container>
      <div class="mask" v-loading="aside_loading" element-loading-text="加载会话中">
      </div>
      <el-aside width="220px"
                class="conver-box"
      >
        <div class="search">
          <el-input style="width:98%;" size="mini" v-model="keyword" @keyup.enter.native="searchSth" @input="handleThrottleSearch" placeholder="搜索名称/订单编号" clearable></el-input>
          <!--<i class="el-icon-search" style="font-size:16px;" @click="searchSth"></i>-->
        </div>
        <div class="header-msg-type">
          <el-dropdown @command="ChangeMsgType" trigger="click">
            <span class="el-dropdown-link">{{ MsgType[conversation_type] }}<i class="el-icon-arrow-down el-icon--right"></i></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="list">
                全部
              </el-dropdown-item>
              <el-dropdown-item command="unread_only">
                未读
              </el-dropdown-item>
              <el-dropdown-item command="pinned">
                标记
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!-- <div class="search-box"><el-input size="mini" v-model="searchInput" @change="searchConversation" placeholder="搜索"></el-input></div> -->
        <ul ref="conversation-box" v-show="conversationsList.length && !remoteSearch" class="conversation-box is-set-scroll">
          <li v-for="(item, index) in conversationsList"
              :key="index"
              :class="activeConversations === item.id ? 'cur' : ''"
              @click="changeConversations(item)"
          >
            <div class="msg-time">
              {{ item.show_last_time }}
            </div>
            <el-badge v-if="item.unread_count > 0" :value="item.unread_count" :max="99" class="item"></el-badge>
            <img :src="item.show_to_avatar" alt="img">
            <i v-if="item.pinned" class="el-icon-star-on show_pinned"></i>
            <div class="tt" :class="item.is_big_order_unread ? 'red-color': ''">
              <span>{{ item.show_to_name }}</span>
              <span v-if="item.latest_message_content && item.latest_message_content.text" style="font-size:12px;color:#666;">
                {{
                  item.latest_message_content.text.length > 14 ? item.latest_message_content.text.slice(0, 14) + '...' : item.latest_message_content.text
                }}</span>
            </div>
            <!--<svg-icon icon-class="wrong" @click.stop="deleteConversations(item, index)"></svg-icon>-->
            <div style="position:absolute;right:10px;bottom:20px;">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link" style="font-size:24px;color:#F56C6C;">…</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ fun: 'setStar', item, index }" icon="el-icon-star-off" :class="item.pinned ? 'pinned' : ''">{{ item.pinned ? '取消' : '设置' }}星标</el-dropdown-item>
                  <el-dropdown-item :command="{ fun: 'setRead', item, index }" icon="el-icon-chat-square">标示为{{ item.unread_count ? '已读' : '未读' }}</el-dropdown-item>
                  <el-dropdown-item :command="{ fun: 'delete', item, index }" icon="el-icon-delete">删除对话</el-dropdown-item>
                  <el-dropdown-item :command="{ fun: 'block', item, index }" :icon="item.is_blocked ? 'el-icon-unlock' : 'el-icon-lock'" :class="item.is_blocked ? 'pinned' : ''">
                    {{ item.is_blocked ? '解封' : '封锁' }}用户
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <span v-if="item.is_blocked" style="position:absolute;right:5px;top:5px;font-size:14px;color:red;background:rgb(249 168 168);">已被封锁</span>
          </li>
        </ul>
        <ul ref="search-box" v-show="searchData.length" class="conversation-box is-set-scroll" v-loading="search_loading" element-loading-text="搜索中">
          <li v-for="(item, index) in searchData"
              :key="index"
              :class="activeConversations === item.id ? 'cur' : ''"
              @click="changeConversations(item)"
          >
            <div class="msg-time">
              {{ item.show_last_time }}
            </div>
            <el-badge v-if="item.unread_count > 0" :value="item.unread_count" :max="99" class="item"></el-badge>
            <img :src="item.show_to_avatar" alt="img">
            <i v-if="item.pinned" class="el-icon-star-on show_pinned"></i>
            <span class="tt">{{ item.show_to_name }}</span>
            <!--<svg-icon icon-class="wrong" @click.stop="deleteConversations(item, index)"></svg-icon>-->
            <div style="position:absolute;right:10px;bottom:20px;" v-if="!item.is_search">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link" style="font-size:24px;color:#F56C6C;">…</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{ fun: 'setStar', item, index }" icon="el-icon-star-off" :class="item.pinned ? 'pinned' : ''">{{ item.pinned ? '取消' : '设置' }}星标</el-dropdown-item>
                  <el-dropdown-item :command="{ fun: 'setRead', item, index }" icon="el-icon-chat-square">标示为{{ item.unread_count ? '已读' : '未读' }}</el-dropdown-item>
                  <el-dropdown-item :command="{ fun: 'delete', item, index }" icon="el-icon-delete">删除对话</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </li>
        </ul>
        <div v-show="!conversationsList.length" style="height:100%;color:#ccc;position:relative">
          <!-- <img src="@/assets/logo.png" class="logo" alt=""> -->
          <span style="position:absolute;top:0;bottom:0;margin:auto 0;height:30px;text-align:center;display:block;width: 100%;">暂无数据</span>
        </div>
        <div v-show="!searchData.length && remoteSearch && !search_loading" style="height:100%;color:#ccc;position:relative">
          <!-- <img src="@/assets/logo.png" class="logo" alt=""> -->
          <span style="position:absolute;top:0;bottom:0;margin:auto 0;height:30px;text-align:center;display:block;width: 100%;">搜索无结果</span>
        </div>
      </el-aside>
      <el-main>
        <chat-box
          :chatParams="chatParams"
          :siteCode="siteCodeName"
          :intervalRead="intervalRead"
          :baseObj="baseObj"
          @emit-readMsg="readMsg"
          @emit-refesh-order-count="getOrderStatusCount"
        ></chat-box>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { topOfAccount } from '@/api/account'
import { fetchAccountList, apiSearchAccountList, apiGetOrderMeta, apiSetPinned, apiSetUnread, getBigOrderCustom } from '@/api/chat'
import { getSearchDetail, apiFetchConversations, deleteConversations, apiReadMessage, getStarInfo, apiSetBlocked } from '@/api/chat'
import { mapGetters } from 'vuex'
import chatBox from './components/chatBox'

const defaultImg = require('@/assets/img_default.jpg')
export default {
  name: 'List',
  components: { chatBox },
  props: {
    siteData: {
      type: Object,
      default: () => {
      }
    },
    activeTag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      bigOrderCustoms: [],
      searchInput: '',
      debounceLiClick: true,
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
      conversationsList: [],
      activeConversations: '',
      chatParams: {},
      orderStatusCountObj: {
        cancelCount: 0,
        refoundCount: 0
      },
      next_timestamp: -1,
      baseObj: {},
      readMsgFlag: true, // 读取消息开关，避免多次请求
      renderListByTime: undefined, // 定时请求的 fn
      intervalRead: false, // 是否为定时请求
      noConversation: false,
      platFormList: {
        'my': 'https://seller.shopee.com.my',
        'sg': 'https://seller.shopee.sg',
        'ph': 'https://seller.shopee.ph',
        'id': 'https://seller.shopee.co.id',
        'th': 'https://seller.shopee.co.th',
        'vn': 'https://banhang.shopee.vn',
        'tw': 'https://seller.shopee.tw'
      },
      keyword: '',
      remoteSearch: false,
      cloneData: [],
      // 星标信息
      starInfo: [],
      // 搜索结果
      searchData: [],
      search_loading: false,
      throttleSearch: this._.throttle(() => {
        const value = this.keyword.trim()
        this.cloneData = this._.uniqBy(this.cloneData, 'id')
        if (!value.length) {
          this.remoteSearch = false
          this.conversationsList = this.cloneData
          return
        }
        if (value.length >= 3) {
          this.remoteSearch = true
          this.searchSth()
        }
      }, 500),
      conversation_type: 'list',
      MsgType: {
        'list': '全部',
        'unread_only': '未读',
        'pinned': '标记'
      }
    }
  },
  computed: {
    localPlatform() {
      return this.platFormList[this.siteData.site_code]
    },
    ...mapGetters([
      'activeAccount'
    ]),
    siteCodeName() {
      return this.siteData.site_code
    }
  },
  created() {
    this.getBigOrder()
  },
  mounted() {
  },
  methods: {
    // 卖家后台登录
    jumpToLoginSeller() {
      window.open(`${ this.accountInfo.seller_url }?platform=shopee&account_id=${ this.accountInfo.id }`)
    },
    handleTopAccount(val) {
      topOfAccount({ id: this.siteData.id, stick: val, not_show_message: true }).then(res => {
        this.siteData.stick = val
        this.$emit('sortTabList', this.siteData)
      }).catch(err => {
        this.$message.error(err)
      })
    },
    // 切换消息类型
    ChangeMsgType(type) {
      if (type !== this.conversation_type) {
        this.conversationsList = []
        this.fetchConversations(type, -1)
      }
    },
    openTheNewTAB(href) {
      if (!/^(http:\/\/)|^(https:\/\/)/.test(href)) {
        href = 'http://' + href
      }
      const realhref = this.siteData.site_code === 'tw' ? 'https://seller.xiapi.shopee.cn' : href
      try {
        window.open(realhref, '_blank')
      } catch (error) {
        this.$message.error('无法打开错误的地址')
      }
    },
    cloneDeep(data) {
      const obj = this._.cloneDeep(this[data])
      this[data] = []
      this[data] = obj
    },
    checkWheel(el) {
      const parentEl = this.$refs['conversation-box']
      const isParent = this.isParent(el.target, parentEl)
      // 向下滚动 && 距离底部500以内 && 在会话列表滚动 && 会话列表没有loading && 有数据
      if (el.wheelDelta < 0 && ((parentEl.scrollTop + parentEl.offsetHeight) >= parentEl.scrollHeight) && isParent && !this.aside_loading && !this.noConversation) {
        this.aside_loading = true
        this.fetchConversations('mouseWheel')
      }
    },
    // 判断父元素中是否包含子元素呢
    isParent(obj, parentObj) {
      while (obj !== undefined && obj !== null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
        if (obj === parentObj) {
          return true
        }
        obj = obj.parentNode
      }
      return false
    },
    /* 查看会话 */
    changeConversations(item) {
      // 非搜索数据，直接执行后续逻辑
      if (!item.is_search) {
        if (this.debounceLiClick) {
          this.intervalRead = false
          this.debounceLiClick = false
          setTimeout(() => {
            this.debounceLiClick = true
          }, 1500)
          if (this.activeConversations === item.id) {
            this.readMsg(item)
            return
          }
          this.activeConversations = item.id
          this.fetchMessages(item)
        }
      } else {
        const obj = {
          authorization: this.accountInfo.token,
          platform: this.accountInfo.api_url || this.localPlatform,
          data: {
            user_id: item.buyer_id,
            shop_id: Number(this.accountInfo.shop[0].shop_id),
            _uid: this.accountInfo.shop[0].shop_uid
          }
        }
        getSearchDetail(obj).then(res => {
          let result = res.data
          this._.forEach(this.starInfo, v => {
            if (v.id === result.id) {
              result.pinned = true
            }
          })
          result.show_to_avatar = defaultImg
          result.to_avatar = result.to_avatar || defaultImg
          result.show_to_name = result.to_name.length > 12 ? result.to_name.substring(0, 12) + '...' : result.to_name
          result.order_id = item.order_id
          // 添加鼠标滚轮事件
          window.addEventListener('mousewheel', this.checkWheel, false)
          this.remoteSearch = false
          this.keyword = ''
          this.searchData = []
          this.cloneData.unshift(result)
          this.cloneData = this._.uniqBy(this.cloneData, 'id')
          this.conversationsList = this.cloneData
          if (this.debounceLiClick) {
            this.intervalRead = false
            this.debounceLiClick = false
            setTimeout(() => {
              this.debounceLiClick = true
            }, 1500)
            if (this.activeConversations === result.id) {
              this.readMsg(result)
              return
            }
            this.activeConversations = result.id
            this.fetchMessages(result)
          }
        })
      }
    },
    /* 删除会话 */
    deleteConversations(item, index) {
      this.$confirm('确认删除？', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(_ => {
        const params = {
          not_show_message: true,
          authorization: this.accountInfo.token,
          platform: this.accountInfo.api_url || this.localPlatform,
          data: {
            conversation_id: item.id,
            shop_id: Number(this.accountInfo.shop[0].shop_id),
            _uid: this.accountInfo.shop[0].shop_uid
          }
        }
        deleteConversations(params).then(response => {
          this._.pullAt(this.conversationsList, index)
          this.chatParams = {}
          this.cloneDeep('conversationsList')
          // 刷新会话
          // this.next_timestamp = -1
          // this.fetchConversations('delConversation', undefined, id)
        })
      }).catch(_ => {
      })
    },
    /* 获取当前用户下站点账户列表 */
    fetchAccountList() {
      const params = {
        user_id: this.user_id,
        not_show_message: true
      }
      fetchAccountList(params).then(response => {
        const { data } = response
        this.options_account = response.data || []
        if (!this.options_account.length) {
          this.options_account = [
            {
              value: 'zhinan',
              label: '暂无数据',
              disabled: true
            }
          ]
          return
        }
        let site_code_id
        let account_id
        // 判断是否通知消息查看详情 由 store 取值后赋值为空
        if (this.activeAccount.length) {
          this._.forEach(this.options_account, v => {
            if (v.account === this.activeAccount[0]) {
              site_code_id = v.id
            }
          })
          account_id = this.activeAccount[1]
        } else {
          site_code_id = data[0].id
          account_id = data[0].child[0].id
        }
        this.formData.account = [site_code_id, account_id]
        this.$store.commit('chat/SET_ACTIVE_ACCOUNT', [])
        // 第一次加载第一个
        this.fetchAccountInfo(this.formData.account)
      }).catch(() => {
      })
    },
    /* 获取当前账户基础信息，需要存储到store中，账户变化时都要去重新获取 */
    fetchAccountInfo(val) {
      this.intervalRead = false
      this.chatParams = {}
      this.conversationsList = []
      this.next_timestamp = -1
      const params = {
        id: val,
        not_show_message: true
      }
      this.$store.dispatch('platform/FetchAccountInfo', params).then(() => {
        this.accountInfo = this.$store.getters.accountInfo || {}
        this.accountInfo.token = `Bearer ${ this.accountInfo.token }`
        // 拿到账户信息后获取会话列表
        this.fetchConversations('init')
        this.getOrderStatusCount()
      }).catch(() => {
        this.conversationsList = []
      })
    },
    // 处理消息体显示时间
    formatShowTime(messageTime) {
      let showTime = ''
      const today = `${ new Date().getMonth() + 1 }月${ new Date().getDate() }日`
      const messageDate = `${ new Date(messageTime).getMonth() + 1 }月${ new Date(messageTime).getDate() }日`
      showTime = messageDate
      const hour = new Date(messageTime).getHours()
      const minutes = new Date(messageTime).getMinutes()
      if (today === messageDate) {
        showTime = `${ hour }:${ minutes > 9 ? minutes : '0' + minutes }`
      }
      return showTime
    },
    /* 获取会话列表 */
    fetchConversations(fromWhere, intervalTime, delete_id) {
      if (this.renderListByTime) {
        clearInterval(this.renderListByTime)
      }
      // 30秒自动请求一次接口
      this.renderListByTime = setInterval(() => {
        // 是否根据定时请求的 来 判断是否需要增加 loading
        this.intervalRead = true
        this.fetchConversations('interval', -1)
      }, 30000)
      const params = {
        not_show_message: true,
        authorization: this.accountInfo.token,
        platform: this.accountInfo.api_url || this.localPlatform,
        data: {
          next_timestamp: intervalTime || this.next_timestamp,
          direction: 'older',
          _uid: this.accountInfo.shop[0].shop_uid || undefined,
          type: this.conversation_type
        }
      }
      if (fromWhere !== 'interval') {
        this.aside_loading = true
      }

      // 未读或标记列表，置空消息列表 增加请求参数
      if (fromWhere === 'unread_only' || fromWhere === 'pinned' || fromWhere === 'list') {
        params.data.type = fromWhere
        this.conversation_type = fromWhere
        this.conversationsList = []
      }
      // -1 时不传时间戳
      if (params.data.next_timestamp === -1) {
        delete params.data.next_timestamp
      }

      apiFetchConversations(params).then(response => {
        this.aside_loading = false
        if (fromWhere !== 'interval') {
          if (response.data.length === 0) {
            this.noConversation = true
            return
          } else {
            this.noConversation = false
          }
        }
        if (fromWhere !== 'interval' && response.data[0]) {
          this.next_timestamp = response.data[0].next_timestamp_nano
        } else {
          this.next_timestamp = -1
        }
        // 成功获取会话列表后获取大金额订单客户，重新排序，格式化会话列表数据
        // getBigOrderCustom().then(res => {
        // 大订单客户
        // let bigOrderCustoms = res.data

        let conversationsList = this._.unionWith(response.data, this.conversationsList, this._.isEqual)
        conversationsList = this._.uniqBy(conversationsList, 'id')
        this._.forEach(conversationsList, v => {
          // 都用默认图片展示
          // v.to_avatar = v.to_avatar || defaultImg
          v.show_to_avatar = defaultImg
          v.to_avatar = v.to_avatar || defaultImg
          v.show_to_name = v.to_name.length > 12 ? v.to_name.substring(0, 12) + '...' : v.to_name
          v.show_last_time = this.formatShowTime(v.last_message_time)
          v.is_big_order_unread = false
        })
        // 根据最后消息时间排序
        this.conversationsList = this._.orderBy(conversationsList, 'last_message_time', 'desc')
        // 如果是删除后请求的会话列表，从数组中移除该会话
        if (delete_id) {
          this.conversationsList = this._.filter(this.conversationsList, v => {
            return v.id !== delete_id
          })
        }
        // 排序大金额订单客户
        this.sortBigOrder()
        this.cloneData = this._.cloneDeep(this.conversationsList)
        if (fromWhere !== 'mouseWheel' && this.conversationsList.length) {
          // 如果有选中的会话，请求后还是选中该会话,否则请求第一条
          const findIndex = this._.findIndex(this.conversationsList, { 'id': this.activeConversations })
          const index = findIndex > -1 ? findIndex : 0
          this.activeConversations = this.conversationsList[index].id
          this.fetchMessages(this.conversationsList[index], 'notRead', fromWhere)
        }
        // })
      }).catch(() => {
        this.aside_loading = false
      })
    },
    sortBigOrder() {
      // 根据大订单金额客户置顶排序
      const first = [], last = []
      if (this.bigOrderCustoms.length) {
        this.conversationsList.forEach(v => {
          // 大金额订单客户且有未读消息即置顶
          if (this.bigOrderCustoms.some(v1 => Number(v1.buyer_shop_id) === Number(v.to_shop_id)) && v.unread_count) {
            v.is_big_order_unread = true
            first.push(v)
          } else {
            last.push(v)
          }
        })
        this.conversationsList = first.concat(last)
      }
    },
    getBigOrder() {
      getBigOrderCustom({ account_id: this.siteData.id, not_show_message: true }).then(res => {
        this.bigOrderCustoms = res.data
      })
    },
    /* 获取消息列表 */
    fetchMessages(item, notRead, fromWhere) {
      this.baseObj = item
      const params = this.createParams(item)
      // 有未读消息 && 读消息 && 不是定时请求的方法 => 请求读取消息接口
      if (item.unread_count > 0 && !notRead && fromWhere !== 'interval') {
        this.readMsg(item)
      }
      this.chatParams = params
    },
    createParams(item) {
      let cookie = ''
      const cookies = this.accountInfo.shop[0].seller_info
      this._.forEach(cookies, (v, i) => {
        if (i !== '0') {
          cookie += `${ v.name }=${ v.value };`
        }
      })
      const params = {
        not_show_message: true,
        authorization: this.accountInfo.token,
        platform: this.accountInfo.api_url || this.localPlatform,
        cookie: cookie,
        type: 'message',
        userImg: item.to_avatar,
        userName: item.to_name,
        data: {
          conversation_id: item.id,
          shop_id: Number(this.accountInfo.shop[0].shop_id),
          _uid: this.accountInfo.shop[0].shop_uid,
          id: item.id,
          to_id: item.to_id,
          from_id: this.accountInfo.shop[0].shop_user_id,
          last_read_message_id: item.latest_message_id,
          to_name: item.to_name,
          to_shop_id: item.to_shop_id
        },
        site: this.siteData.account,
        site_code: this.siteData.id
      }
      if (item.order_id) {
        params.data.order_id = item.order_id
      }
      return params
    },
    readMsg(item) {
      if (this.readMsgFlag && item.unread_count > 0) {
        this.readMsgFlag = false
        const params = this.createParams(item)
        apiReadMessage(params).then((res) => {
          item.unread_count = 0
          // 已读消息去掉大金额订单标记
          item.is_big_order_unread = false
          this.readMsgFlag = true
        }).catch(() => {
          this.readMsgFlag = true
        })
      }
    },
    // 获取 取消/退款 订单数
    getOrderStatusCount() {
      let cookie = ''
      const cookies = this.accountInfo.shop[0].seller_info
      this._.forEach(cookies, (v, i) => {
        if (i !== '0') {
          cookie += `${ v.name }=${ v.value };`
        }
      })
      const data = {
        platform: this.accountInfo.api_url || this.localPlatform,
        cookie,
        not_show_message: true
      }
      apiGetOrderMeta(data).then(res => {
        if (res.data) {
          this.orderStatusCountObj = {
            refoundCount: res.data.refund_unprocessed,
            cancelCount: res.data.request_cancellation
          }
        } else {
          this.orderStatusCountObj = {
            refoundCount: 0,
            cancelCount: 0
          }
        }
      }).catch(() => {
        this.orderStatusCountObj = {
          refoundCount: 0,
          cancelCount: 0
        }
      })
    },
    handleThrottleSearch() {
      this.throttleSearch()
    },
    handleInput() {
      const value = this.keyword.trim()
      this.cloneData = this._.uniqBy(this.cloneData, 'id')
      if (!value.length) {
        this.remoteSearch = false
        this.conversationsList = this.cloneData
        return
      }
      if (value.length >= 3) {
        this.remoteSearch = true
        this.searchSth()
      }
    },
    // 搜索
    searchSth() {
      if (this.remoteSearch) {
        this.search_loading = true
        window.removeEventListener('mousewheel', this.checkWheel)
        const obj = {
          not_show_message: true,
          authorization: this.$store.getters.accountInfo.token,
          platform: this.$store.getters.accountInfo.api_url,
          data: {
            per_page: '50',
            page: '1',
            keyword: this.keyword,
            _uid: this.$store.getters.accountInfo.shop[0].shop_uid
          }
        }
        const starParams = {
          authorization: this.$store.getters.accountInfo.token,
          platform: this.$store.getters.accountInfo.api_url,
          data: {
            direction: 'older',
            _uid: this.$store.getters.accountInfo.shop[0].shop_uid
          }
        }
        getStarInfo(starParams).then(res => {
          this.starInfo = res.data
        })
        apiSearchAccountList(obj).then(res => {
          const keywordData = this._.uniqBy(res.data, 'buyer_id')
          this._.forEach(keywordData, v => {
            // 都用默认图片展示
            // v.to_avatar = v.to_avatar || defaultImg
            v.show_to_avatar = defaultImg
            v.to_avatar = v.buyer_avatar || defaultImg
            v.show_to_name = v.buyer_name.length > 12 ? v.buyer_name.substring(0, 12) + '...' : v.buyer_name
            v.is_search = true
          })
          // 6个及以上字符订单搜索
          if (this.keyword.trim().length > 5) {
            obj.data.keyword = this.keyword.trim()
            obj.data.type = 'order'
            apiSearchAccountList(obj).then(response => {
              const orderData = this._.uniqBy(response.data, 'buyer_id')
              this._.forEach(orderData, v => {
                // 都用默认图片展示
                // v.to_avatar = v.to_avatar || defaultImg
                v.show_to_avatar = defaultImg
                v.to_avatar = v.buyer_avatar || defaultImg
                v.show_to_name = v.buyer_name.length > 12 ? v.buyer_name.substring(0, 12) + '...' : v.buyer_name
                v.is_search = true
              })
              // 搜索结果合并去重
              this.searchData = this._.unionWith(keywordData, orderData, this._.isEqual)
              this.searchData = this._.uniqBy(this.searchData, 'buyer_id')
            }).finally(() => {
              this.search_loading = false
            })
          } else {
            this.searchData = keywordData
            this.search_loading = false
          }
        }).catch(() => {
          this.search_loading = false
        })
      }
    },
    // 会话列表下拉菜单
    handleCommand(command) {
      // 删除会话
      if (command.fun === 'delete') {
        this.deleteConversations(command.item, command.index)
      }
      // 设置、取消 星标
      if (command.fun === 'setStar') {
        this.setStar(command.item, command.index)
      }
      // 标记为已读、未读
      if (command.fun === 'setRead') {
        this.setRead(command.item, command.index)
      }
      // 封锁、解封用户
      if (command.fun === 'block') {
        this.setBlock(command.item, command.index)
      }
    },
    // 设置星标
    setStar(item, index) {
      const obj = {
        authorization: this.$store.getters.accountInfo.token,
        platform: this.$store.getters.accountInfo.api_url,
        data: {
          type: item.pinned ? 'unpin' : 'pin',
          conversation_id: item.id,
          _uid: this.$store.getters.accountInfo.shop[0].shop_uid
        }
      }
      apiSetPinned(obj).then(() => {
        this.conversationsList[index].pinned = !item.pinned
      })
    },
    // 设置封锁、解锁用户
    setBlock(item, index) {
      const tips = item.is_blocked ? `确定解封 ${ item.to_name } 吗？` : `确定封锁 ${ item.to_name } 吗？`
      const content = item.is_blocked ? `${ item.to_name } 将能够与您聊天，评论或购买您的商品` : `${ item.to_name } 将无法与您聊天，评论或购买您的商品`
      this.$confirm(content, tips, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const obj = {
          authorization: this.$store.getters.accountInfo.token,
          platform: this.$store.getters.accountInfo.api_url,
          data: {
            type: item.is_blocked ? 'cancle' : 'set',
            to_id: String(item.to_id),
            shop_id: String(item.shop_id),
            _uid: this.$store.getters.accountInfo.shop[0].shop_uid
          }
        }
        apiSetBlocked(obj).then(() => {
          this.conversationsList[index].is_blocked = !item.is_blocked
        })
      }).catch(() => {
      })
    },
    // 设置 已读、未读
    setRead(item, index) {
      // 设置为已读
      if (item.unread_count) {
        this.readMsg(item)
      } else {
        // 设置为未读
        const obj = {
          authorization: this.$store.getters.accountInfo.token,
          platform: this.$store.getters.accountInfo.api_url,
          data: {
            direction: 'older',
            _uid: this.$store.getters.accountInfo.shop[0].shop_uid,
            shop_id: Number(this.accountInfo.shop[0].shop_id),
            conversation_id: item.id
          }
        }
        apiSetUnread(obj).then(() => {
          this.conversationsList[index].unread_count = 1
        })
      }
    }
  },
  filters: {},
  watch: {
    activeTag: {
      immediate: true,
      handler(val) {
        // 切换标签重置为全部状态
        this.conversation_type = 'list'
        if (val === this.siteData.account) {
          if (!this.accountInfo || !this.conversationsList.length) {
            this.aside_loading = true
            this.fetchAccountInfo(this.siteData.id)
          } else {
            // 重新赋值请求当前会话消息（子组件里监听此对象）
            this.intervalRead = true
            this.getOrderStatusCount()
            this.fetchConversations('interval', -1)
            if (this.renderListByTime) {
              clearInterval(this.renderListByTime)
            }
            this.renderListByTime = setInterval(() => {
              // 是否根据定时请求的 来 判断是否需要增加 loading
              this.intervalRead = true
              this.fetchConversations('interval', -1)
            }, 30000)
          }
          window.addEventListener('mousewheel', this.checkWheel, false)
        } else {
          clearInterval(this.renderListByTime)
          window.removeEventListener('mousewheel', this.checkWheel)
        }
      }
    }
  },
  destroyed() {
    clearInterval(this.renderListByTime)
    window.removeEventListener('mousewheel', this.checkWheel)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.header-msg-type {
  display: flex;
  flex-direction: row-reverse;
  padding: 0 5px 5px 5px;

  .el-dropdown {
    cursor: pointer;
  }
}

.show_pinned {
  color: #F56C6C;
  position: absolute;
  top: 38px;
  left: 24px;
}

.pinned {
  color: #F56C6C;
}

.search {
  margin-top: 5px;
  margin-left: 6px;
  margin-bottom: 5px;
  position: relative;

  i {
    position: absolute;
    top: 5px;
    right: 9px;
    cursor: pointer;
  }
}

.el-container {
  position: relative;
  height: 700px;
  overflow-y: auto;
  border: 1px solid #d3dce6;

  .mask {
    position: absolute;
    width: 220px;
    height: 100%;
    border-right: 1px solid;
  }

  .el-aside {
    position: relative;
    border-right: 1px solid #d3dce6;

    .conver-box {
      position: relative;
    }

    .search-box {
      padding: 8px 12px;
    }

    overflow: hidden;

    ul {
      margin: 0;
      height: 92%;
      list-style: none;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;

      li {
        position: relative;
        width: 100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        list-style: none;
        padding: 8px 12px;
        display: inline-flex;
        cursor: pointer;
        border-bottom: 1px solid #d3dce6;

        &.cur {
          background-color: #dde7f1;
        }

        .msg-time {
          position: absolute;
          right: 5px;
          bottom: 0;
          font-size: 12px;
          color: #666;
        }

        .el-badge {
          position: absolute !important;
          top: 8px;
          left: 2px;
        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-block;
        }

        .tt {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #333;
          font-size: 14px;
          //line-height: 44px;
          padding-left: 12px;
        }

        .red-color {
          color: red;
        }

        .svg-icon {
          color: red;
          display: none;
          position: absolute;
          top: 10px;
          right: 10px;
        }

        &:hover {
          background-color: #dde7f1;

          .svg-icon {
            color: red;
            display: inline-block;
          }
        }
      }
    }
  }

  .el-main {
    /*background-color: #3a8ee6;*/
    padding: 0;
  }
}
</style>
