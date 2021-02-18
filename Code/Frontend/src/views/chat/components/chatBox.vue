<template>
  <div class="chat-right-wrap">
    <div class="chat-box" :style="{ 'width': !orderBoxShow || JSON.stringify(chatParams) === '{}' ? '100%' : 'calc(100% - 480px)' }">
      <div v-show="JSON.stringify(chatParams) !== '{}'" class="msg-box" @onmousewheel.passive="checkScroll" v-loading="loading" element-loading-background="rgba(255, 255, 255, 1)">
        <div class="triangle" v-show="!orderBoxShow && requested">
          <svg-icon icon-class="left" @click="triggerOrderShow" ></svg-icon>
        </div>
        <ul :style="{ 'padding-top': activeProductObj.source_type ? '64px' : '' }" ref="msg-box-ul" class="msg-box-ul is-set-scroll">
          <div v-if="isNoMsg" style="text-align:center;color: #ccc; font-size: 14px;">暂无更多消息</div>
          <div v-if="loadingShow" class="loading-wrap"><i class="el-icon-loading"></i></div>
          <template v-for="(item) in msgList" >
            <!-- 只展示用户的议价 （消息列表里会返回 type 为 web_chat 的无用议价） -->
            <li v-if="!(['offer'].includes(item.type) && item.status === 'web_chat')" :key="item.id" :class="chatParams.data && Number(item.from_id) === Number(chatParams.data.from_id) ? 'ownMsg' : 'otherMsg' ">
              <!-- 议价上方正在浏览的商品由议价请求后数据渲染 -->
              <productCard
                v-if="item.showProductObj"
                :isRequest="false"
                :siteCode="siteCode"
                :showProductObj="item.showProductObj"
              ></productCard>
              <!-- 聊天列表里消息 -->
              <productCard
                v-if="item.activeProductObj"
                :isRequest="true"
                :siteCode="siteCode"
                :activeProductObj="item.activeProductObj"
              ></productCard>
              <!-- 暂时展示 'text', 'image', 'sticker' 'product' 状态的消息 -->
              <div v-if="['text', 'image', 'sticker', 'product', 'offer', 'order'].includes(item.type)" style="overflow: hidden">
                <img :src="item.img" alt="img" class="avatar">
                <div class="item-content">
                  <!-- 文字消息 -->
                  <div class="text-wrap" v-if="item.type === 'text' || item.type === 'product'">
                    <pre v-html="item.content.show_text">
                    </pre>
                    <!-- 翻译 id、th 站点的文字消息 -->
                    <div class="translate-box" style="border-top:1px dotted #ccc" v-if="hasTranslateSite.includes(siteCode) && item.type === 'text'">
                      <span v-if="!item.translated && !item.translating" class="translate-btn" @click="translateMessage(item)" :style="{'color': chatParams.data && Number(item.from_id) === Number(chatParams.data.from_id) ? 'hsla(0,0%,100%,.5)' : '#06c'}">
                        {{ chatParams.data && Number(item.from_id) === Number(chatParams.data.from_id) ? 'Show Translation' : 'Translate Message' }}
                      </span>
                      <div v-if="item.translating && !item.translated" style="color:rgba(0,0,0,.42); font-size: 12px;margin-top:5px">Translating...</div>
                      <div v-if="item.translated">
                        <p style="margin: 10px 0" :style="{ 'color': hasTranslateSite.includes(siteCode) ? '#000' : '' }">
                          <svg-icon icon-class="success" style="color: green"></svg-icon>
                          {{ item.content.translation.text }}
                        </p>
                        <span style="color:rgba(100, 100, 100, .5); font-size: 12px">
                          Translated by {{ item.content.translation.source }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <!-- 图片消息 -->
                  <div class="img-box" v-if="item.type === 'image'">
                    <picture-view v-if="item.content.url" :thumbnail="false" :pictureList="[item.content.url]"></picture-view>
                  </div>
                  <!-- 表情包消息 -->
                  <div class="sticker-box" v-if="item.type === 'sticker'">
                    <img :src="item.sticker_img">
                  </div>
                  <!-- 议价消息 -->
                  <div v-if="item.type === 'offer'">
                    <bargaining-card
                      :baseObj="item"
                      :productOption="productOption"
                      :siteCode="siteCode"
                      @emit-bargaining_status="set_bargaining_status"
                      @emit-bargaining_product="set_bargaining_product"
                    ></bargaining-card>
                  </div>
                  <!-- 订单消息 -->
                  <div v-if="item.type === 'order'">
                    <order-chat-card v-if="chatParams.data && Number(item.from_id) === Number(chatParams.data.from_id)" :intervalRead="intervalRead" :siteCode="siteCode" :baseObj="item" :productOption="productOption"></order-chat-card>
                    <a v-else target="_blank" :href="productOption.platform.replace('seller.', '') + '/user/purchase/order/' + item.content.order_id + '?shopid=' + productOption.data.shop_id">您所购买的订单已寄出。点击以打开在商城。</a>
                  </div>
                  <i v-if="!item.sendSuccess && item.textLoading" class="el-icon-loading"></i>
                  <i v-if="!item.sendSuccess && !item.textLoading" @click="addMessage(item, 'old')" style="color: red;" class="el-icon-warning"></i>
                  <span style="color:#b0b0b0;">{{ item.created_timestamp | moment('YYYY-MM-DD HH:mm:ss') }}</span>
                </div>
              </div>
              <!-- 展示议价处理状态 由 bargaining-card 组件请求后返回 -->
              <div class="item-btm-wrap">
                <div class="item-btm" v-if="item.type === 'offer' && showBtmStatus.includes(item.show_bargaining_status)">
                  {{ item.show_bargaining_status | filterBargainingStatus(chatParams.userName) }}
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
      <div class="talk-box" :class="'talk-box-' + talkBoxKey" v-show="requested && JSON.stringify(chatParams) !== '{}'">
        <div ref="slide-tool">
          <div class="slide-tool sticker-tool" :class="{ 'active': slideShow === 'sticker' }">
            <sticker @send-sticker="addMessage" :stickerObj="stickerObj"></sticker>
          </div>
          <div class="slide-tool product-tool" :class="{ 'active': slideShow === 'product' }">
            <products @send-product="addMessage" :slideShow="slideShow" :siteCode="siteCode" :productOption="productOption"></products>
          </div>
          <div class="slide-tool sticker-tool" :class="{ 'active': slideShow === 'fastReply' }">
            <div style="padding: 5px 5px;height:300px;overflow: auto;" class="is-set-scroll">
              <div style="padding-top:60px; padding-left:15px;">
                <div :class="{ 'top-box': slideShow === 'fastReply' }">
                  <el-button size="mini" type="primary" @click="openReplyDialog" style="float:right;">管理</el-button>
                  <el-input size="mini" v-model="fastReplyKeyword" style="margin-top: 10px;" @input="searchFastReply" placeholder="请输入关键字"></el-input>
                </div>
                <div v-loading="replyLoading" style="clear: both;color:rgb(176,176,176);padding-top: 15px;">
                  <div v-if="replyList.length">
                    <div style="padding: 3px 0; cursor: pointer;overflow-wrap: break-word;color:#000;" v-for="(v,index) in replyList" :key="index" @click="addMessage({ text: v.message }, 'text')">
                      {{ v.message }}
                    </div>
                  </div>
                  <div v-else style="color:rgb(176,176,176);text-align: center">空空如也</div>
                </div>
              </div>
            </div>
          </div>
          <div class="tool-box">
            <el-tooltip class="item" effect="dark" content="贴图" placement="bottom">
              <svg-icon icon-class="Smile" @click="showSlide('sticker')" ></svg-icon>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="图片" placement="bottom" @click.native="hideSlide">
              <upload :productOption="productOption" :baseObj="uploadBaseObj" @send-img="addMessage" @send-img-error="uploadImgError" @send-img-url="imgSuccess"></upload>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="商品" placement="bottom">
              <svg-icon icon-class="bags" @click="showSlide('product')" ></svg-icon>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="快捷回复" placement="bottom">
              <svg-icon icon-class="menu1" @click="showSlide('fastReply')"></svg-icon>
            </el-tooltip>
          </div>
        </div>
        <el-input
          resize="none"
          class="talk-input"
          type="textarea"
          ref="talk-input"
          :rows="4"
          placeholder="请输入内容"
          @keydown.enter.native.prevent.exact="addMessage({ text: content }, 'text')"
          @keydown.enter.ctrl.native.prevent.exact="lineFeed"
          v-model="content"
        >
        </el-input>
        <div class="send-btm">
          <span>Enter发送，Ctrl+Enter换行</span>
          <el-button type="primary" size="mini" :disabled="content.trim() === ''" @click="addMessage({ text: content }, 'text')">发送</el-button>
        </div>
      </div>
      <div v-show="JSON.stringify(chatParams) === '{}'" calss="no-msg-box" style="height:100%;text-align:center;color:#ccc;">
        <!-- <img src="@/assets/logo.png" class="logo" alt=""> -->
        <span style="position:absolute;top:0;bottom:0;margin:auto 0;height:30px;">Shopee 聊聊</span>
      </div>
    </div>
    <div v-show="JSON.stringify(chatParams) !== '{}'" :style="{ 'width': orderBoxShow ? '480px' : 0 }" style="overflow:hidden;">
      <orderBox
        :intervalRead="intervalRead"
        :siteCode="siteCode"
        :productOption="productOption"
        @emit-triggerOrderShow="triggerOrderShow"
        @emit-send-order="addMessage"
        @emit-refesh-order-count="emitRefeshOrderCount"
      ></orderBox>
    </div>
    <paste-img-dialog v-bind.sync="imgDialogOption" @send-image="addMessage"></paste-img-dialog>
    <fast-reply-manager v-bind.sync="fastReplyOption"></fast-reply-manager>
  </div>
</template>

<script>
const { sticker_map } = require('@/utils/sticker_map')
const defaultImg = require('@/assets/img_default.jpg')
const sticker_img = require('@/assets/no-sticker.png')
import PictureView from 'vue-simple-picture-preview'
import { apiFetchmessage, apiSendMessage, apiTranslateText, getReplyList } from '@/api/chat'
import sticker from './sticker'
import products from './products'
import bargainingCard from './card/bargainingCard'
import productCard from './card/productCard'
import upload from './upload'
import orderBox from './orderBox'
import orderChatCard from './card/orderChatCard'
import pasteImgDialog from './pasteImgDialog'
import fastReplyManager from './fastReply/fastReplyManager'
export default {
  components: { sticker, products, productCard, PictureView, upload, bargainingCard, orderBox, orderChatCard, pasteImgDialog, fastReplyManager },
  props: {
    chatParams: {
      type: Object,
      default: () => {}
    },
    intervalRead: {
      type: Boolean
    },
    baseObj: {
      type: Object,
      default: () => {}
    },
    siteCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileList: [],
      stickerMap: sticker_map,
      loading: false,
      content: '',
      loadingShow: false,
      msg_limit: 20, // 请求的条数
      requested: false,
      isNoMsg: false, // 请求一次没有请求到数据就不再请求了
      msgList: [
      ],
      isUrl: () => {
        return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([0-9-a-zA-Z0-9@:%_+.~#?&//=]*)/g
      },
      slideShow: '',
      productOption: {},
      activeProductObj: {}, // 当前用户正在浏览的商品
      uploadBaseObj: {}, // 图片上传的对象 因上传完组件里无法定位对应消息的图片路径，传入 obj 后传出
      showBtmStatus: ['accepted', 'rejected', 'cancelled'],
      debounceCheckScroll: this._.debounce(() => {
        if (this.baseObj.unread_count) {
          this.$emit('emit-readMsg', this.baseObj)
        }
      }, 3000),
      hasTranslateSite: ['id', 'th', 'vn', 'br'], // 需要翻译的站点
      orderBoxShow: true, // 右侧订单信息栏是否展示
      imgDialogOption: {
        open: false,
        data: {}
      },
      talkBoxKey: Math.floor(Math.random() * 1000000000 + 1) + '', // 给每个 talk-box 设置理想化的唯一的类名
      fastReplyOption: {
        open: false,
        replyList: []
      },
      fastReplyKeyword: '',
      copyReplyList: [],
      replyLoading: true,
      replyList: [{ message: 'hello' }, { message: 'sorry' }],
    }
  },
  created() {
    this.resetScroll()
    this.addMouseWheel()
    this.addOtherClick()
  },
  mounted() {
  },
  computed: {
    latest_message_id() {
      const id = this.msgList[0].id
      // id = this.msgList[Math.floor(this.msgList.length / 20)].id
      return id
    },
    stickerObj() {
      return this.stickerMap[this.siteCode] || {}
    }
  },
  methods: {
    // 快捷回复搜索
    searchFastReply(val) {
      this.replyList = this.copyReplyList
      if (val.trim()) {
        this.replyList = this.replyList.filter(v => { return v.message.toLowerCase().indexOf(val.toLowerCase()) !== -1 })
      }
    },
    // 快捷回复列表
    getReply() {
      getReplyList(this.$store.getters.accountInfo.id).then(res => {
        this.replyList = res.data
        this.copyReplyList = this._.cloneDeep(this.replyList)
        this.$nextTick(() => {
          this.replyLoading = false
        })
      }).catch(() => {
      })
    },
    // 快捷回复弹窗
    openReplyDialog() {
      this.fastReplyOption = {
        open: true,
        replyList: this.replyList
      }
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      })
    },
    openTheNewTAB(href) {
      if (!/^(http:\/\/)|^(https:\/\/)/.test(href)) {
        href = 'http://' + href
      }
      try {
        window.open(href, '_blank')
      } catch (err) {
        this.$message.error('无法打开错误的地址')
      }
    },
    emitRefeshOrderCount() {
      this.$emit('emit-refesh-order-count')
    },
    addMouseWheel() {
      window.addEventListener('mousewheel', this.checkWheel, false)
    },
    addOtherClick() {
      window.addEventListener('click', this.checkOutClick, false)
    },
    // 检测外部点击，收缩 表情包与产品框
    checkOutClick(el) {
      if (!this.isParent(el.target, this.$refs['slide-tool'])) {
        this.slideShow = ''
      }
    },
    checkWheel(el) {
      const parentEl = this.$refs['msg-box-ul']
      const isParent = this.isParent(el.target, parentEl)
      // 向上滑动 && 滚动到顶部 && 在消息栏上滚动 && 当前没有请求数据 && 有消息
      if (el.wheelDelta > 0 && parentEl.scrollTop <= 0 && isParent && !this.loadingShow && !this.isNoMsg) {
        this.loadingShow = true
        this.getMoreMsgList()
      }
      parentEl.addEventListener('scroll', this.checkScroll)
    },
    checkScroll() {
      this.debounceCheckScroll()
    },
    // 判断父元素中是否包含子元素
    isParent(obj, parentObj) {
      while (obj !== undefined && obj !== null && obj.tagName && obj.tagName.toUpperCase() !== 'BODY') {
        if (obj === parentObj) {
          return true
        }
        obj = obj.parentNode
      }
      return false
    },
    getMoreMsgList() {
      if (this.msgList.length < 20) {
        this.isNoMsg = true
        this.loadingShow = false
        return
      }
      this.getChatMessage(undefined, this.latest_message_id)
    },
    // 添加内容
    /**
     * @param
     * @content obj 发送的内容
     * @type str 发送的类型
     * @textContent any 其他数据（发送商品的详细数据 || 区分粘贴发送图片 （'isPaste'））
     */
    addMessage(content, type, otherData) {
      this.checkScroll()
      this.slideShow = ''
      let obj
      if (type === 'old') {
        obj = content
        obj.textLoading = true
        const sendContent = this._.cloneDeep(obj.content)
        this.sendMessage(obj, sendContent)
      }
      if (['text', 'sticker', 'product', 'image', 'order'].includes(type)) {
        if (type === 'text' && !content.text.trim()) {
          return
        }
        obj = {
          img: defaultImg,
          created_timestamp: Math.floor(this.$moment(new Date()).valueOf() / 1000),
          content,
          textContent: typeof otherData === 'object' ? otherData : undefined,
          textLoading: true,
          sendSuccess: false,
          status: 'web_chat',
          from_id: this.chatParams.data.from_id,
          type
        }
        this.msgList.push(obj)
        this.resetScroll()
        if (type === 'text') {
          this.content = ''
        }
        if (type !== 'image' || otherData === 'isPaste') {
          const sendContent = this._.cloneDeep(obj.content)
          this.formatShowList()
          this.sendMessage(obj, sendContent)
        } else {
          this.uploadBaseObj = obj
        }
      }
      this.formatSpecial()
    },
    formatSpecial() {
      this._.forEach(this.msgList, v => {
        if ((v.type === 'text' || v.type === 'product') && !v.formated) {
          v.content.show_text = this.replaceTag(v.content.text)
          v.content.show_text = this.replaceReg(this.isUrl(), v.content.show_text)
          v.content.show_text = v.content.show_text.replace(/↵/g, '\n')
          v.formated = true
        }
      })
    },
    replaceReg(reg, str) {
      return str.replace(reg, function(m) {
        let urlm
        if (!/^(http:\/\/)/.test(m) && !/^(https:\/\/)/.test(m)) {
          urlm = 'http://' + m
        } else {
          urlm = m
        }
        return '<a href="' + urlm + '" target="_black" style="color:green;text-decoration:underline green">' + m + '</a>'
      })
    },
    replaceTag: function(str) {
      let s = ''
      if (str.length === 0) return ''
      s = str
      s = s.replace(/</g, '&lt;')
      s = s.replace(/>/g, '&gt;')
      // s = s.replace(/\s/g, '&nbsp;')
      s = s.replace(/\'/g, '&#39;')
      s = s.replace(/\"/g, '&quot;')
      return s
    },
    // 翻译消息
    translateMessage(item) {
      this.$set(item, 'translating', true)
      this.$forceUpdate()
      if (item.content.translation) {
        setTimeout(() => {
          item.translated = true
          item.translating = false
          this.$forceUpdate()
        }, 300)
      } else {
        const data = this.createTranslateData(item)
        apiTranslateText(data).then((res) => {
          item.content.translation = {
            source: res.data.source,
            text: res.data.text
          }
          item.translated = true
          item.translating = false
          this.$forceUpdate()
        }).catch(() => {
          item.translating = false
          this.$forceUpdate()
        })
      }
    },
    createTranslateData(item) {
      const cloneData = this.chatParams
      const isSeller = Number(cloneData.data.from_id) === Number(item.from_id)
      const obj = {
        platform: cloneData.platform,
        authorization: cloneData.authorization,
        data: {
          text: item.content.text,
          _uid: cloneData.data._uid,
          shop_id: isSeller ? Number(item.from_shop_id) : Number(item.to_shop_id),
          from: isSeller ? 'seller' : 'buyer',
          to_user_id: isSeller ? Number(item.to_id) : Number(item.from_id)
        },
        not_show_message: true
      }
      return obj
    },
    // 选择图片成功后执行
    imgSuccess(obj, content) {
      this.uploadBaseObj = {}
      this.formatShowList()
      this.resetScroll()
      this.sendMessage(obj, content)
    },
    uploadImgError(obj) {
      this.msgList = this._.differenceWith(this.msgList, [obj], this._.isEqual)
      this.$message.error('图片发送失败')
    },
    // 议价下方展示 接受、拒绝、取消状态
    set_bargaining_status(val, obj) {
      this.$set(obj, 'show_bargaining_status', val)
    },
    // 议价上方产品信息
    set_bargaining_product(val, obj) {
      this.$set(obj, 'showProductObj', val)
    },
    sendMessage(obj, content) {
      const cloneData = this._.cloneDeep(this.chatParams)
      const user_id = this.$store.getters.userInfo.id
      const params = {
        platform: cloneData.platform,
        not_show_message: true,
        authorization: cloneData.authorization,
        data: {
          id: cloneData.data.id,
          // shop_id: cloneData.data.shop_id,
          _uid: cloneData.data._uid,
          to_id: cloneData.data.to_id,
          content: content,
          fetchStatus: 'done',
          translateStatus: 'pending',
          type: obj.type,
          textContent: obj.textContent,
          request_id: Math.random() + '',
          from_id: Number(cloneData.data.from_id),
          user_id,
          to_name: cloneData.data.to_name,
          to_shop_id: cloneData.data.to_shop_id
        }
      }
      // 搜索展示出的会话增加order_id参数
      if (cloneData.data.order_id) {
        params.data.order_id = cloneData.data.order_id
      }
      apiSendMessage(params).then((res) => {
        const findHasMsg = this._.filter(this.msgList, v => {
          return v.id === res.data.id
        })
        if (findHasMsg.length > 0) {
          obj.sendSuccess = false
        } else {
          obj.id = res.data.id
          obj.sendSuccess = true
        }
        obj.textLoading = false
      }).catch(() => {
        setTimeout(() => {
          obj.sendSuccess = false
          obj.textLoading = false
        }, 200)
      })
    },
    resetScroll() {
      setTimeout(() => {
        const el = this.$refs['msg-box-ul']
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      }, 400)
    },
    checkBottom() {
      const el = this.$refs['msg-box-ul']
      const isBottom = Math.abs(el.scrollTop + el.offsetHeight - el.scrollHeight) < 200
      return isBottom
    },
    // 换行
    lineFeed() {
      this.content += '\n'
    },
    formatShowList(forceToBottom) {
      this._.forEach(this.msgList, v => {
        // 只对接收到的数据进行处理图片
        if (v.id) {
          v.sendSuccess = true
          if (Number(v.from_id) !== Number(this.chatParams.data.from_id)) {
            v.img = this.chatParams.userImg
          } else {
            v.img = defaultImg
          }
        }
        if (v.type === 'sticker') {
          const stickerArr = this.stickerMap[this.siteCode].imgArr
          this._.forEach(stickerArr, v1 => {
            if (v1.id === v.content.sticker_id && v1.sticker_package_id === v.content.sticker_package_id) {
              v.sticker_img = v1.url
            }
          })
          v.sticker_img = v.sticker_img || sticker_img
        }
        if (v.type === 'product' && !v.formated) {
          v.content.text = '商品链接：' + this.chatParams.platform.replace('seller.', '') + '/product/' + v.content.shop_id + '/' + v.content.product_id
        }
        if (v.type === 'image' && this.siteCode === 'tw') {
          v.content.url = v.content.url.replace('cf.shopee.tw', 's-cf-tw.shopeesz.com')
        }
        // . && 有正在浏览产品
        if (v.type === 'text' && v.source_type === 'product') {
          v.activeProductObj = {
            source_type: v.source_type,
            data: this._.assign(v.source_content, { _uid: this.chatParams.data._uid }),
            platform: this.chatParams.platform,
            authorization: this.chatParams.authorization,
            not_show_message: true
          }
          v.activeProductObj.data.product_id = v.activeProductObj.data.product_id || v.activeProductObj.data.order_id
        }
      })
    },
    getChatMessage(forceToBottom, offset) {
      if (!this.intervalRead && !this.loadingShow) {
        this.loading = true
      }
      const obj = this._.cloneDeep(this.chatParams)
      obj.data.limit = this.msg_limit + ''
      obj.data.offset = offset
      // 存储当前聊天第一个li，用于加载消息后设置滚动位置
      const ele = this.$refs['msg-box-ul']
      let topEl = ''
      if (offset && ele) {
        topEl = ele.querySelector('li')
      }
      apiFetchmessage(obj).then((res) => {
        const isBottom = this.checkBottom()
        if (!this.requested) {
          this.$nextTick(() => {
            const el = document.querySelector(`.talk-box-${this.talkBoxKey}`)
            el.addEventListener('paste', this.getPastData)
          })
        }
        this.requested = true
        this.loadingShow = false
        setTimeout(() => {
          this.loading = false
        }, 400)
        // 滚动条在最下面 || 不是定时请求，滚动条到底部
        if (isBottom || forceToBottom) {
          this.resetScroll()
        }
        // 在向上滑动的情况下  请求的数据不是20的整数就说明没数据了
        if (offset) {
          this.isNoMsg = res.data.length !== 20
        }
        if (res.data) {
          if (this.baseObj.id === res.data[0].conversation_id) {
            // 防止发送过程自动刷新，合并去重
            this.msgList = this._.unionWith(res.data, this.msgList, this._.isEqual) || []
            this._.forEach(this.msgList, (v) => {
              v.translated = v.translated || false
              v.translating = v.translating || false
            })
            // 消息一般最上为最新消息，翻转数组，避免相同时间排序出现错误的问题
            this._.reverse(this.msgList)
            // 去除当前会话无关消息，避免会话突然消失 消息异常合并
            this.msgList = this._.filter(this.msgList, v => {
              return v.conversation_id === this.chatParams.data.id || !v.sendSuccess
            })
            // 筛选发送异常消息，待 id 去重后，再赋值回去（uniq 去重后会错误删除消息）
            const sendList = this._.filter(this.msgList, v => !v.id)
            this.msgList = this._(this.msgList).filter(v => v.id).uniqBy('id').concat(sendList).sortBy('created_timestamp').value()
            // 转换是否翻译过
            this.formatShowList(forceToBottom)
            this.formatSpecial()
            // 定位滚动条
            if (offset) {
              this.$nextTick(() => {
                this.$refs['msg-box-ul'].scrollTop = topEl && (topEl.offsetTop) - 20
              })
            }
          }
        }
      }).catch(() => {
        // this.msgList = []
        this.loadingShow = false
        setTimeout(() => {
          this.loading = false
        }, 400)
      })
    },
    getPastData(e) {
      const that = this
      var cbd = e.clipboardData
      // 没有数据
      if (!(e.clipboardData && e.clipboardData.items)) {
        return
      }
      for (var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i]
        if (item.kind === 'file') {
          var blob = item.getAsFile()
          if (blob.size === 0) {
            return
          }
          // 插入图片记录
          var reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onload = function(data) {
            that.imgDialogOption = {
              open: true,
              data: {
                src: data.target.result,
                productOption: that.productOption
              }
            }
          }
        }
      }
    },
    initData() {
      this.isNoMsg = false
      this.requested = false
      this.msgList = []
      this.activeProductObj = {}
      this.content = ''
    },
    showSlide(type) {
      if (this.slideShow === type) {
        this.slideShow = ''
      } else {
        this.slideShow = type
      }
    },
    hideSlide() {
      this.slideShow = ''
    },
    triggerOrderShow() {
      this.orderBoxShow = !this.orderBoxShow
    }
  },
  filters: {
    filterBargainingStatus(val, userName) {
      const statusMap = new Map([
        ['accepted', '您已接受此出价'],
        ['rejected', '您已拒绝此出价'],
        ['cancelled', `${userName}已取消此出价`]
      ])
      return statusMap.get(val)
    }
  },
  watch: {
    chatParams: {
      handler(val) {
        if (val.data) {
          this.productOption = {
            platform: val.platform,
            authorization: val.authorization,
            cookie: val.cookie,
            data: {
              _uid: val.data._uid,
              shop_id: val.data.shop_id,
              to_id: val.data.to_id
            },
            site: val.site,
            userName: val.userName
          }
        }
        // 不是定时请求的时候才重置数据
        if (!this.intervalRead || JSON.stringify(val) === '{}') {
          this.slideShow = ''
          this.initData()
        }
        if (JSON.stringify(val) !== '{}') {
          this.getChatMessage(!this.intervalRead)
        }
      }
    },
    slideShow(val) {
      if (val === 'fastReply') {
        this.getReply()
      }
      if(!val) {
        this.fastReplyKeyword = ''
      }
    }
  },
  destroyed() {
    window.removeEventListener('mousewheel', this.checkWheel, false)
    const el = this.$refs['msg-box-ul']
    if (el) {
      el.removeEventListener('scroll', this.checkScroll, false)
    }
    const slideEl = this.$refs['slide-tool']
    if (slideEl) {
      el.removeEventListener('scroll', this.checkScroll, false)
    }
    const talkEl = document.querySelector(`.talk-box-${this.talkBoxKey}`)
    if (talkEl) {
      talkEl.removeEventListener('paste', this.getPastData)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.chat-right-wrap {
  height: 100%;
  display: flex;
}
.chat-box {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid #d3dce6;
  .top {
    padding: 5px 0;
    text-align: center;
    background: #cccccc;
  }
  .logo {
    margin-top: -12px;
    height: 50px;
    width: 40px;
  }
  .msg-box {
    .triangle {
      position: absolute;
      top: 15px;
      right: 0;
      z-index: 888;
      .svg-icon {
        font-size: 20px;
        background: #ccc;
        color: #fff;
        border-radius: 50%;
        cursor: pointer;
      }
      &:hover {
        color: #ff6700;
      }
    }
    position: relative;
    height: calc(100% - 188px);
    font-size: 14px;
    .loading-wrap {
      font-size: 16px;
      padding: 2px 0;
      text-align: center;
    }
    .active-product {
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 999;
    }
    ul {
      padding: 0 20px;
      height: 100%;
      margin: 0;
      overflow-y: auto;
    }
    li {
      margin-top: 10px;
      overflow: hidden;
      list-style: none;
      .avatar {
        vertical-align: top;
        height: 40px;
        width: 40px;
        border-radius: 50%;
      }
      .item-content {
        max-width: 75%;
        a {
          text-decoration: underline;
          color: green;
        }
        .text-wrap {
          border-radius: 4px;
          padding: 10px;
          text-align: left;
        }
        pre{
          display: block;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 20px;
          font-family: "微软雅黑";
        }
        .img-box {
          img {
            max-width: 300px;
            border: 1px solid #cccccc;
            cursor: pointer;
          }
        }
        .sticker-box {
          img {
            max-width: 100px;
          }
        }
        .translate-btn {
          cursor: pointer;
          text-decoration: underline;
        }
      }
      // 别人的消息
      &.otherMsg {
        .avatar, .item-content {
          float: left;
        }
        .item-content {
          padding-left: 20px;
          padding-right: 20px;
          position: relative;
          text-align: left;
          pre {
            text-align: left;
          }
        }
        .text-wrap {
          background: #f4f4f4;
        }
        i {
          height: 16px;
          width: 16px;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 10px;
          margin: auto 0;
        }
      }
      // 自己的消息
      &.ownMsg {
        .avatar, .item-content {
          float: right;
        }
        .item-content {
          overflow: hidden;
          position: relative;
          padding-left: 30px;
          padding-right: 20px;
          text-align: right;
          pre {
            color: #fff;
            text-align: left;
          }
        }
        .text-wrap {
          background: rgb(81, 180, 255);
        }
        i {
          height: 16px;
          width: 16px;
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto 0;
        }
      }
      .item-btm-wrap {
        text-align: center;
        padding-bottom: 5px;
        .item-btm {
          display: inline-block;
          padding: 0 1.285em;
          background-color: rgba(0,0,0,.2);
          border-radius: 2px;
          color: #fff;
          text-align: center;
          line-height: 30px;
          max-width: 2300px;
          margin: 0 auto;
        }
      }
    }
  }
  .talk-box {
    width: 100%;
    height: 188px;
    border-top: 1px solid #cccccc;
    position: relative;
    z-index: 99;
    .send-btm {
      padding: 10px 20px;
      width: 100%;
      text-align: right;
      background: #fff;
      & > span {
        margin-right: 20px;
        line-height: 28px;
        display: inline-block;
        color: #666;
        font-size: 14px;
      }
    }
    .tool-box {
      height: 45px;
      padding: 10px 0 0;
      background: #fff;
      .svg-icon {
        font-size: 20px;
        color: #ff6700;
        cursor: pointer;
      }
      .item {
        margin-left: 20px;
      }
    }
    .slide-tool {
      position: absolute;
      background: #fff;
      left: 0;
      width: 100%;
      transition: -webkit-transform 366ms ease-in-out;
      transition: all 366ms ease-in-out;
      /* transition: transform 366ms ease-in-out,-webkit-transform 366ms ease-in-out; */
      border-top: .07em solid rgba(0,0,0,.05);
      z-index: -1;
      top: 0;
      &.active {
        transform: translateY(-100%)
      }
    }
  }
}
.top-box {
  position: fixed;
  top: 0;
  left: 0;
  margin-top: -5px;
  height: 70px;
  width: 100%;
  padding: 0 15px;
  margin-bottom: 10px;
  padding-top: 10px;
  background: rgb(255, 255, 255);
  border-top: 1px solid #ccc;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.talk-input {
  textarea {
    border: none;
  }
}
</style>
