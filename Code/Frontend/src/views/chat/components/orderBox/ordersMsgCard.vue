<template>
  <!-- 聊天右侧订单信息栏 -->
  <div class="order-msg-card">
    <div class="top">
      <div class="top-cloum">
        <div style="font-size: 14px" :style="{ 'color': orderStatus.color }">{{ orderStatus.label }}</div>
        <div>{{ $moment(orderData.created_at).format('YYYY-MM-DD HH:mm') }}</div>
      </div>
      <div class="top-cloum" style="margin-top:5px">
        <div>
          <span>{{ orderData.serial_number }} {{ show_payment_method ? `[${show_payment_method}]` : '' }}</span>
          <i class="el-icon-s-order" style="font-size:16px;cursor:pointer;" @click="copyOrderId(orderData.serial_number)" title="复制订单号"></i>
        </div>
        <div>
          <span class="link-text" @click="orderCol('sendLink')">传送链接</span>
          <span class="link-text" @click="orderCol('info')">查看详情</span>
          <!-- <span class="link-text" @click="orderCol('cancel')" v-if="statusMap.canCancelOrder.includes(orderData.status)">取消订单</span> -->
        </div>
      </div>
    </div>
    <div class="content ft-12">
      <el-row>
        <el-col style="border-right: 1px dashed #d4d4d4" :span="12">
          <div class="product-item mt-2" v-for="(item, index) in orderData.products" :key="index">
            <img :src="item.image" alt="">
            <div>
              <p class="ft-14 hover-link-text" :style="{ 'color' : item.status === 3 ? '#ccc !important' : ''}" @click="openTheNewTAB(item.product_url)">{{ item.title }}</p>
              <span class="small-text" :style="{ 'color' : item.status === 3 ? '#ccc !important' : ''}" v-show="item.model_name">[{{ item.model_name }}] <br></span>
              <span class="small-text">{{ currency }} {{ item.price }} X {{ item.count }}</span><br>
              <span class="small-text" v-if="item.sku">产品id：{{ item.sku }}</span><br>
              <span class="small-text" v-if="item.istore_child_id">子产品id：{{ item.istore_child_id }}</span>
              <!-- 状态为2展示买家评价，1为未评价 -->
              <div style="display:flex;width: 120px;background:rgb(252, 252, 252)" v-if="item.status === 2">
                <el-rate
                  class="rate-star"
                  v-model="item.rate_star"
                  disabled
                  score-template="{value}"
                ></el-rate> &nbsp;&nbsp;&nbsp;
                <el-popover placement="top" trigger="hover" v-if="item.rate_comment">
                  <p style="max-width: 170px">
                    <span style="color:#888">Buyer Evaluation</span> <br>
                    <span style="color:#000;">{{ item.rate_comment }}</span>
                  </p>
                  <svg-icon icon-class="information" slot="reference"></svg-icon>
                </el-popover>
              </div>
              <span v-if="item.status === 3 || item.status === 4" class="text-block">申请退款/退货 ({{ refundExt[orderData.status_ext] || '' }})</span>
            </div>
          </div>
        </el-col>
        <el-col style="padding: 0 10px;" :span="12">
          <!-- 付款金额无准确字段与算法、暂不做展示 -->
          <!-- <div class="content-cloum">
            <div>付款</div>
            <div>
              <span style="color: rgb(255, 58, 18)">{{ currency }} {{ orderData.receivables ? orderData.receivables.toFixed(2) : 0 }}</span>
            </div>
          </div> -->
          <div class="content-cloum" v-if="statusMap.showLogistics.includes(orderData.status)">
            <div>物流</div>
            <div>{{ orderData.carrier }}</div>
          </div>
          <div class="content-cloum" v-if="statusMap.showLogisticsInfo.includes(orderData.status)">
            <div>物流信息</div>
            <div>
              <el-popover placement="right" trigger="hover" @show="getLogistics">
                <ul class="main-range is-set-scroll" v-loading="logisticsLoading" element-loading-background="rgba(255, 255, 255, 1)">
                  <div v-if="!logisticsList.length && ! logisticsLoading" style="text-align: center; margin-top:10px">暂无物流信息</div>
                  <li v-for="(item, index) in logisticsList" :key="index" :class="index === 0 ? 'isActive' : ''">
                    <h4 v-if="item.description">{{ item.description }}</h4>
                    <p>{{ $moment(item.created_at).format('YYYY-MM-DD HH:mm') }}</p>
                  </li>
                </ul>
                <svg-icon icon-class="information" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </div>
          <div class="mt-10" v-if="statusMap.showShipment.includes(orderData.status) && orderData.status_ext !== statusExt.ORDER_EXT_CANCEL_PENDING">
            <div class="mt-5">出货日期</div>
            <div class="mt-5">{{ $moment(orderData.ship_by_date).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="mt-10" v-if="statusMap.showOrderPayTime.includes(orderData.status) && orderData.pay_time">
            <div class="mt-5">订单付款时间</div>
            <div class="mt-5">{{ $moment(orderData.pay_time).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="mt-10" v-if="statusMap.showCancel.includes(orderData.status)">
            <div class="mt-5" style="color: rgb(255, 152, 0)">
              {{ orderData.cancel_user_id === -1 ? '系统' : '' }}
              {{ orderData.cancel_user_id === orderData.buyer_id ? '由买家' : '' }}
              {{ orderData.cancel_user_id === orderData.seller_id ? '卖家' : '' }}
              取消
            </div>
            <div class="mt-5">"{{ calcelRenson }}"</div>
          </div>
          <div class="mt-10" v-if="statusMap.showCancel.includes(orderData.status)">
            <div class="mt-5">同意取消时间</div>
            <div class="mt-5">{{ $moment(orderData.cancel_time ).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="mt-10" v-if="statusMap.showRefund.includes(orderData.status)">
            <div class="mt-5">退款</div>
            <div class="mt-5">{{ currency }} {{ orderData.refund_amount }}</div>
          </div>
          <div class="mt-10" v-if="statusMap.showShipTime.includes(orderData.status)">
            <div class="mt-5">运送时间</div>
            <div class="mt-5">{{ $moment(orderData.delivery_time).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="mt-10" v-if="statusMap.canCancelOrder.includes(orderData.status) && orderData.status_ext === statusExt.ORDER_EXT_CANCEL_PENDING">
            <div class="mt-5" style="color: rgb(255, 152, 0)">买家申请取消订单</div>
            <div class="mt-5">{{ calcelRenson }}</div>
            <div class="mt-5">
              <el-button size="mini" type="info" plain @click="operateCancelRequest(false)">拒绝</el-button>
              <el-button size="mini" type="primary" plain @click="operateCancelRequest(true)">接受</el-button>
            </div>
          </div>
          <div class="mt-10" v-if="statusMap.showComplete.includes(orderData.status)">
            <div class="mt-5">完成时间</div>
            <div class="mt-5">{{ $moment(orderData.complete_time).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <!--<div class="mt-10" v-if="statusMap.showComplete.includes(orderData.status)">-->
          <!--<div v-if="orderData.seller_rate_star">-->
          <!--<div class="mt-5">评价买家</div>-->
          <!--<div class="mt-5">-->
          <!--<el-rate-->
          <!--class="rate-star"-->
          <!--v-model="orderData.seller_rate_star"-->
          <!--disabled-->
          <!--score-template="{value}"-->
          <!--&gt;</el-rate>-->
          <!--</div>-->
          <!--</div>-->
          <!--&lt;!&ndash; 评价买家超时暂不展示 &ndash;&gt;-->
          <!--&lt;!&ndash; <div v-else>-->
          <!--<div class="mt-5">卖家评价时间超时</div>-->
          <!--<div class="mt-5">{{ $moment(orderData.rate_by_date).format('YYYY-MM-DD HH:mm') }}</div>-->
          <!--</div> &ndash;&gt;-->
          <!--</div>-->
        </el-col>
        <el-col>
          <div class="istore-order">
            <span>Order Number:</span>
            <a v-if="orderData.order_url" :href="orderData.order_url" target="_blank">{{ orderData.order_number }}</a>
            <span v-else>{{ orderData.order_number }}</span>
          </div>
        </el-col>
        <el-col>
          <div class="istore-order">
            <span>Tracking Number:</span>
            <a v-if="orderData.tracking_url" :href="orderData.tracking_url" target="_blank">{{ orderData.tracking_number }}</a>
            <span v-else>{{ orderData.tracking_number }}</span>
          </div>
        </el-col>
        <el-col>
          <div class="order-note" style="color:#333;">
            <el-button v-if="orderData.seller_note" type="text" icon="el-icon-edit" @click="addNote">编辑</el-button>
            <el-button v-else type="text" icon="el-icon-plus" @click="addNote">添加备注</el-button>
            <div><i class="el-icon-notebook-2"></i>订单备注</div>
          </div>
          <div v-if="orderData.seller_note" class="note-content">
            {{ orderData.seller_note }}
          </div>
        </el-col>
        <el-col v-if="statusMap.showComplete.includes(orderData.status)">
          <div class="order-note" style="color:#333;">
            <!--<el-button v-if="!orderData.seller_rate_star" type="text" icon="el-icon-edit" @click="addNote">编辑</el-button>-->
            <div>
              <el-button v-if="orderData.status_ext === 14 && ((!orderData.seller_rate_star && !orderData.rate_by_date) || (!orderData.seller_rate_star && new Date().getTime() < (new Date(orderData.rate_by_date).getTime())))" type="text" icon="el-icon-star-off" @click="rateCustom">立即评价</el-button>
              <el-rate
                v-else
                class="rate-star"
                v-model="orderData.seller_rate_star"
                disabled
                score-template="{value}"
              ></el-rate>
            </div>
            <div><i class="el-icon-star-off"></i>评价买家</div>
          </div>
          <div v-if="orderData.seller_rate_comment" class="note-content">
            <span v-if="orderData.seller_rate_comment.length < 65">
              {{ orderData.seller_rate_comment }}
            </span>
            <div v-else>
              <el-popover
                title="评论"
                trigger="hover"
                :content="orderData.selle_rate_comment"
              >
                <div slot="reference">
                  <span>{{ orderData.seller_rate_comment.slice(0,65) }}...</span>
                  <svg-icon icon-class="information" slot="reference"></svg-icon>
                </div>
              </el-popover>
            </div>
          </div>
          <div v-if="orderData.rate_by_date && !orderData.seller_rate_star" class="rate-date">
            评价超时于{{ formatDate(orderData.rate_by_date) }}
          </div>
        </el-col>
      </el-row>
      <cancelOrderDialog v-bind.sync="cancelOrderDialogOption"></cancelOrderDialog>
    </div>
    <note-dialog v-bind.sync="noteDialog" @refreshOrderList="refreshOrder"></note-dialog>
    <rate-custom v-bind.sync="rateDialog" @refreshOrderList="refreshOrder"></rate-custom>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import { apiGetLogistics, apiSetCancelOrder } from '@/api/chat'
  import cancelOrderDialog from '../cancelOrderDialog'
  import noteDialog from './noteDialog'
  import rateCustom from './rateCustom'

  export default {
    name: 'Sticker',
    components: { cancelOrderDialog, noteDialog, rateCustom },
    data() {
      return {
        // status_ext 字段表示的状态 （取自平台源码，暂未全部用到）
        statusExt: {
          ORDER_EXT_DELETE: 0,
          ORDER_EXT_UNPAID: 1,
          ORDER_EXT_PAID: 2,
          ORDER_EXT_SHIPPED: 3,
          ORDER_EXT_COMPLETED: 4,
          ORDER_EXT_INVALID: 6,
          ORDER_EXT_CANCEL_PROCESSING: 7,
          ORDER_EXT_CANCEL_COMPLETED: 8,
          ORDER_EXT_RETURN_PROCESSING: 9,
          ORDER_EXT_RETURN_COMPLETED: 10,
          ORDER_EXT_ESCROW_PAID: 11,
          ORDER_EXT_ESCROW_CREATED: 12,
          ORDER_EXT_ESCROW_PENDING: 13,
          ORDER_EXT_ESCROW_VERIFIED: 14,
          ORDER_EXT_ESCROW_PAYOUT: 15,
          ORDER_EXT_CANCEL_PENDING: 16
        },
        refundExt: {
          2: '已取消',
          9: '尚未通过',
          11: '已通过',
          14: '已完成'
        },
        orderStatusList: [
          { label: '未付款', name: 'unpaid', color: '#000' },
          { label: '待出货', name: 'to_ship', color: '#4a90e2' },
          { label: '运送中', name: 'shipping', color: '#4a90e2' },
          { label: '已完成', name: 'completed', color: '#53d38a' },
          { label: '已取消', name: 'cancelled', color: '#b4b4b4' },
          { label: '退款', name: 'refund', color: '#9b9b9b' }
        ],
        statusMap: {
          showLogistics: ['refund', 'to_ship', 'completed', 'shipping'], // 展示物流的状态
          showLogisticsInfo: ['refund', 'completed', 'shipping'], // 展示物流信息的状态
          showShipment: ['to_ship'], // 展示出货日期的状态
          showCancel: ['cancelled'], // 展示 取消 / 取消时间 的状态
          showOrderPayTime: ['to_ship'], // 展示订单付款时间的状态
          showRefund: ['refund'], // 展示退款的状态
          showComplete: ['completed'], // 展示完成时间的状态
          showShipTime: ['shipping'], // 展示运送时间的状态
          canCancelOrder: ['to_ship'] // 显示取消订单操作的状态
        },
        orderDetailShowMap: {
          paymentMethodList: [
            {
              code: 1,
              label: '信用卡'
            },
            {
              code: 2,
              label: '银行转账'
            },
            {
              code: 4,
              label: '在线'
            },
            {
              code: 6,
              label: '货到付款'
            },
            {
              code: 20,
              label: 'Shopee钱包'
            },
            {
              code: 27,
              label: 'ShopeePay'
            }
          ],
          cancelReasonList: [
            {
              buyer_cancel_reason: 1,
              cancel_reason: 0,
              reason: '卖家没有回应我的询问'
            },
            {
              buyer_cancel_reason: 9,
              cancel_reason: 0,
              reason: '其他/改变主意'
            },
            {
              buyer_cancel_reason: 0,
              cancel_reason: 1,
              reason: '缺货'
            },
            {
              buyer_cancel_reason: 9,
              cancel_reason: 3,
              reason: '无法运送范围'
            },
            {
              buyer_cancel_reason: 0,
              cancel_reason: 3,
              reason: '无法运送范围'
            },
            {
              buyer_cancel_reason: 0,
              cancel_reason: 100,
              reason: '未付款'
            },
            {
              buyer_cancel_reason: 0,
              cancel_reason: 302,
              reason: '由Shopee系统自动取消'
            }
          ]
        },
        logisticsList: [],
        logisticsLoading: false,
        cancelOrderDialogOption: {
          open: false,
          orderData: {},
          productOption: {},
          siteCode: ''
        },
        noteDialog: {
          open: false,
          orderInfo: {}
        },
        rateDialog: {
          open: false,
          orderInfo: {}
        },
      }
    },
    props: {
      orderData: {
        type: Object,
        default: () => {
        }
      },
      siteCode: {
        type: String,
        default: ''
      },
      productOption: {
        type: Object,
        default: () => {
        }
      },
      intervalRead: Boolean
    },
    computed: {
      currency() {
        if (this.siteCode) {
          return currencyBySiteMap[this.siteCode]
        } else {
          return ''
        }
      },
      orderStatus() {
        let obj = {}
        this._.forEach(this.orderStatusList, v => {
          if (v.name === this.orderData.status) {
            obj = v
          }
        })
        return obj
      },
      // 卡片上展示支付方式
      show_payment_method() {
        let str = ''
        this._.forEach(this.orderDetailShowMap.paymentMethodList, v => {
          if (v.code === this.orderData.payment_method) {
            str = v.label
          }
        })
        return str || ''
      },
      // 卡片上展示取消原因
      calcelRenson() {
        let str = ''
        this._.forEach(this.orderDetailShowMap.cancelReasonList, v => {
          if (v.buyer_cancel_reason === this.orderData.buyer_cancel_reason && v.cancel_reason === this.orderData.cancel_reason) {
            str = v.reason
          }
        })
        if (this.orderData.cancel_user_id !== -1 && str === '未付款') {
          str = ''
        }
        return str || '不明原因'
      }
    },
    methods: {
      // 评价买家
      rateCustom() {
        this.rateDialog = {
          open: true,
          orderInfo: Object.assign(this.orderData, this.productOption)
        }
      },
      formatDate(val) {
        const year = new Date(val).getFullYear()
        const month = new Date(val).getMonth() + 1
        const date = new Date(val).getDate()
        const hour = new Date(val).getHours()
        const minutes = new Date(val).getMinutes()
        return `${year}年${month}月${date}日，${hour > 9 ? hour : ('0' + hour)}: ${minutes > 9 ? minutes : ('0' + minutes)}`
      },
      // 刷新订单列表
      refreshOrder() {
        this.$emit('emit-refesh-order')
      },
      // 添加备注
      addNote() {
        this.noteDialog = {
          open: true,
          orderInfo: Object.assign(this.orderData, this.productOption)
        }
      },
      // 复制订单号
      copyOrderId(id) {
        let oInput = document.createElement('input')
        oInput.value = id
        document.body.appendChild(oInput)
        oInput.select() // 选择对象;
        document.execCommand('Copy') // 执行浏览器复制命令
        document.body.removeChild(oInput)
        this.$message.success('成功复制')
      },
      cloneDeep(data) {
        const obj = this._.cloneDeep(this[data])
        this[data] = {}
        this[data] = obj
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
      orderCol(type) {
        if (type === 'info') {
          // const platform = this.siteCode === 'tw' ? 'https://seller.xiapi.shopee.cn' : this.productOption.platform
          // const url = `${platform}/portal/sale/${this.orderData.id}`
          // 插件跳转
          const path = `/portal/sale/${this.orderData.id}`
          const url = `${ this.$store.getters.accountInfo.seller_url }?platform=shopee&account_id=${ this.$store.getters.accountInfo.id }&path=${ path }`
          this.openTheNewTAB(url)
        }
        if (type === 'sendLink') {
          const obj = {
            order_id: this.orderData.id,
            shop_id: this.productOption.shop_id
          }
          this.$emit('emit-send-order', obj, 'order')
        }
        if (type === 'cancel') {
          this.cancelOrderDialogOption = {
            open: true,
            orderData: this.orderData,
            productOption: this.productOption,
            siteCode: this.siteCode
          }
        }
      },
      // 鼠标移入获取物流信息
      getLogistics() {
        if (!this.logisticsList.length) {
          this.logisticsLoading = true
          const data = this.createLogisticData()
          apiGetLogistics(data).then(res => {
            this.logisticsLoading = false
            this.logisticsList = res.data ? res.data[0] : []
            this._.forEach(this.logisticsList, v => {
              if (v.type === 2) {
                v.description = v.description || '已收到订单详情'
              }
            })
          }).catch(() => {
            this.logisticsLoading = false
          })
        }
      },
      createLogisticData() {
        const cloneData = this.productOption
        const obj = {
          platform: cloneData.platform,
          authorization: cloneData.authorization,
          data: {
            _uid: cloneData.data._uid,
            shop_id: cloneData.data.shop_id,
            order_ids: [this.orderData.id]
          },
          not_show_message: true
        }
        return obj
      },
      operateCancelRequest(type) {
        const msg = type ? '接受取消订单申请后，该订单将立即取消，买家付款的任何款项都将退还。请不要出货此订单。如果您已经发货，请拒绝取消订单申请。确认接受？' : '如果您拒绝此申请，若尚未发货，订单将维持原始状态。请在拒绝此申请后安排出货。确认拒绝此申请？'
        this.$confirm(msg, `${type ? '接受' : '拒绝'}取消订单`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
          this.$emit('emit-loading', true)
          const data = this.createCancelOrderData(type)
          apiSetCancelOrder(data).finally(() => {
            this.$emit('emit-refesh-order')
          })
        }).catch(() => {
        })
      },
      createCancelOrderData(type) {
        const cloneData = this.productOption
        const obj = {
          platform: cloneData.platform,
          authorization: cloneData.authorization,
          cookie: cloneData.cookie,
          data: {
            orderid: this.orderData.id,
            shopid: cloneData.data.shop_id,
            cancel: type,
            _uid: cloneData.data._uid
          }
        }
        return obj
      },
      initData() {
        this.logisticsList = []
        this.logisticsLoading = false
      }
    },
    watch: {
      productOption: {
        deep: true,
        immediate: true,
        handler(val) {
          if (JSON.stringify(val) !== '{}' && !this.intervalRead) {
            this.initData()
          }
          if (JSON.stringify(val) === '{}') {
            this.initData()
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .order-note {
    display: flex;
    flex-direction: row-reverse;
    color: #4a90e2;
    justify-content: space-between;
    line-height:40px;
    font-size:14px;
    .el-rate{
      margin-top: 15px;
    }
  }

  .link-text {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
  }

  .small-text {
    color: #888;
    font-size: 12px;
    line-height: 16px;
  }

  .order-msg-card {
    width: 100%;
    border-radius: 2px;
    margin-bottom: 20px;
    border: 1px solid #d4d4d4;
    .top {
      padding: 10px;
      background: #f4f4f4;
      color: #000;
      font-size: 12px;
      .top-cloum {
        display: flex;
        justify-content: space-between;
      }
    }
    .content {
      // font-size: 14px;
      padding: 10px;
      .product-item {
        display: flex;
        img {
          height: 48px;
          width: 48px;
        }
        > div {
          width: calc(100% - 60px);
          margin-left: 10px;
          p {
            width: 100%;
            height: 32px;
            overflow: hidden;
            word-break: break-word;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            margin: 5px 0;
          }
        }
      }
      .content-cloum {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
      }
      .pay-tip-box {
        li {
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }

  .main-range {
    width: 150px;
    height: 300px;
    padding: 0 3px;
    overflow-y: auto;
    li {
      &.isActive {
        h4 {
          color: #ff0a00;
        }
        &:before {
          background: #ff0a00;
        }
      }
      border-left: 1px solid #888;
      padding: 0 5px 10px 10px;
      position: relative;
      h4 {
        color: #000;
        font-weight: normal;
        margin: 0;
      }
      p {
        margin-top: 5px;
        color: #888;
      }
      &:before {
        position: absolute;
        content: '';
        top: 0;
        left: -3px;
        height: 6px;
        width: 6px;
        border-radius: 50%;
        background: #888;
        z-index: 999;
      }
      &:last-of-type {
        padding-bottom: 0;
      }
    }
  }

  .text-block {
    display: inline-block;
    border-radius: 2px;
    padding: 3px;
    background: #cfcfcf;
    margin-top: 5px;
    color: #fff;
  }
  .note-content{
    margin: 2px 0 0 14px;
    padding: 3px 8px;
    font-size: 13px;
    color: #000;
    background-color: #f8f8f8;
    border-radius: 1px;
    word-break: break-word;
    line-height: 16px;
  }
  .rate-date{
    text-align: right;
    color: #666;
    font-size: 12px;
  }
  .istore-order{
    color: #444;
    margin: 10px 0 0 0;
    font-size: 14px;
    a{
      color: #3a8ee6;
    }
  }
</style>
