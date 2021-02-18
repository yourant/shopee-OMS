<template>
  <!-- 聊天窗口右侧订单列表 -->
  <div class="order-page">
    <div
      class="user-box"
      v-loading="userLoading"
    >
      <div class="user-top">
        <div class="triangle">
          <svg-icon
            icon-class="right"
            @click="triggerOrderShow"
          />
        </div>
        {{ productOption.userName }}
      </div>
      <el-row
        style="margin-top:10px;"
        element-loading-background="rgba(255, 255, 255, 1)"
      >
        <el-col :span="12">
          <el-col :span="8">
            买家评价
          </el-col>
          <el-col :span="16">
            <el-rate
              class="rate-star"
              v-model="userinfo.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </el-col>
        </el-col>
        <el-col :span="12">
          城市 &nbsp;&nbsp;  {{ userinfo.city || '--' }}
        </el-col>
      </el-row>
      <div style="margin-top:10px;">
        成功的订单 &nbsp;&nbsp; {{ userCount.successful_price ? currency : '' }} {{ userCount.successful_price }} &nbsp;&nbsp; {{ userCount.successful_count ? `（${userCount.successful_count}个订单）` : '' }}
      </div>
      <div style="margin-top:10px;">
        失败的订单 &nbsp;&nbsp; {{ userCount.unsuccessful_price ? currency : '' }} {{ userCount.unsuccessful_price }} &nbsp;&nbsp; {{ userCount.unsuccessful_count ? `（${userCount.unsuccessful_count}个订单）` : '' }}
      </div>
    </div>
    <el-tabs
      v-model="activeName"
      :stretch="true"
    >
      <el-tab-pane
        label="订单"
        name="order"
      >
        <el-tabs
          v-model="orderActice"
          :stretch="true"
        >
          <el-tab-pane
            v-for="item in orderStatusList"
            :key="item.name"
            :label="item.label"
            :name="item.name"
          >
            <div
              class="order-card-box is-set-scroll"
              style="padding: 10px;"
              v-loading="orderLoading"
              element-loading-background="rgba(255, 255, 255, 1)"
            >
              <ordersMsgCard
                :siteCode="siteCode"
                :product-option="productOption"
                :interval-read="intervalRead"
                v-for="(sub_item, index) in showOrderList"
                :order-data="sub_item"
                :key="index"
                @emit-send-order="eimtSendOrder"
                @emit-refesh-order="getOrderInfo"
                @emit-loading="emitLoading"
              />
              <div
                v-show="!showOrderList.length"
                class="no-order-box"
              >
                暂无订单
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { currencyBySiteMap } from '@/utils/statusMap'
  import ordersMsgCard from './orderBox/ordersMsgCard'
  import { apiGetOrderList, apiGetBuyerCount, apiGetBuyerInfo, getIstoreOrder } from '@/api/chat'
  export default {
    name: 'OrderPage',
    components: {
      ordersMsgCard
    },
    props: {
      productOption: {
        type: Object,
        default: () => {}
      },
      intervalRead: Boolean,
      siteCode: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        userinfo: {},
        userCount: {},
        activeName: 'order',
        orderActice: 'all',
        orderStatusList: [
          { label: '全部', name: 'all' },
          { label: '未付款', name: 'unpaid' },
          { label: '待出货', name: 'to_ship' },
          { label: '运送中', name: 'shipping' },
          { label: '已完成', name: 'completed' },
          { label: '已取消', name: 'cancelled' },
          { label: '退款', name: 'refund' }
        ],
        orderLoading: false,
        userLoading: false,
        orderList: []
      }
    },
    computed: {
      showOrderList() {
        if (this.orderActice === 'all') {
          return this.orderList
        } else {
          const list = this._.filter(this.orderList, v => {
            return v.status === this.orderActice
          })
          return list
        }
      },
      // 货币单位
      currency() {
        if (this.siteCode) {
          return currencyBySiteMap[this.siteCode]
        } else {
          return ''
        }
      }
    },
    methods: {
      // 缩回订单栏
      triggerOrderShow() {
        this.$emit('emit-triggerOrderShow')
      },
      eimtSendOrder(obj, type) {
        this.$emit('emit-send-order', obj, type)
      },
      emitLoading(type) {
        this.orderLoading = type
      },
      getOrderInfo() {
        const data = this.createOrderData()
        if (!this.intervalRead) {
          this.orderLoading = true
        }
        this.$emit('emit-refesh-order-count')
        apiGetOrderList(data).then((res) => {
          if (res.data[0] && res.data[0].buyer_id === this.productOption.data.to_id) {
            this.orderList = res.data || []
            this._.forEach(this.orderList, v => {
              this._.forEach(v.products, v1 => {
                v1.rate_star = Number(v1.rate_star)
              })
            })
          }
          this.formatOrderList()
          const orderIdList = this.orderList.map(v => v.serial_number)
          getIstoreOrder({
            valitoken: JSON.stringify({ 'userID': 'pzwg_yingyan', 'token': 'eeed4f9ffaa9bcbc5b3d1117ade04cf7' }),
            action: 'Order_getTrackingCode',
            parameter: JSON.stringify({ 'order_id': orderIdList.join(',') }),
            not_show_message: true
          }).then(res => {
            this.orderLoading = false
            const result = res.data
            if (!Array.isArray(result)) {
              const copyList = this._.cloneDeep(this.orderList)
              copyList.forEach(v => {
                if (Object.keys(result).includes(v.serial_number)) {
                  v.order_number = result[v.serial_number].order_number || ''
                  v.tracking_number = result[v.serial_number].tracking_number || ''
                  v.tracking_url = result[v.serial_number].tracking_url || ''
                  v.order_url = result[v.serial_number].order_url || ''
                  v.products.forEach(v1 => {
                    let sub = result[v.serial_number].product.filter(v2 => v1.sku === String(v2.istore_product_id))[0]
                    v1.istore_child_id = sub ? sub['sub_product_id'].join(' ') : ''
                  })
                }
              })
              this.orderList = this._.uniqBy(copyList.concat(this.orderList),'serial_number')
            }
          }).catch(() => {
            this.orderLoading = false
          })
        }).catch(() => {
          this.orderLoading = false
          this.orderList = []
        })
      },
      formatOrderList() {
        let platform = ''
        if (this.siteCode === 'tw') {
          platform = 'https://xiapi.xiapibuy.com'
        } else {
          platform = this.$store.state.platform.info.web_url
        }
        this._.forEach(this.orderList, v => {
          this._.forEach(v.products, v1 => {
            v1.product_url = platform.replace('seller.', '').replace('banhang.', '') + '/product/' + this.productOption.data.shop_id + '/' + v1.product_id
          })
        })
      },
      // 获取成功、失败的订单
      getAccountInfo() {
        const data = this.createAccountData()
        if (!this.intervalRead) {
          this.userLoading = true
        }
        apiGetBuyerCount(data).then((res) => {
          this.userCount = res.data
          this.userLoading = false
        }).catch(() => {
          this.userLoading = false
          this.userCount = {}
        })
      },
      // 获取用户城市与星星
      getBuyerInfo() {
        const data = {
          platform: this.productOption.platform,
          authorization: this.productOption.authorization,
          data: {
            _uid: this.productOption.data._uid,
            to_id: this.productOption.data.to_id + ''
          },
          not_show_message: true
        }
        apiGetBuyerInfo(data).then(res => {
          this.userinfo = res.data
          this.userinfo.rating = this.userinfo.rating ? Number(this.userinfo.rating.toFixed(1)) : 0
          this.$forceUpdate()
        })
      },
      // 订单列表创建参数
      createOrderData() {
        const cloneData = this.productOption
        const obj = {
          platform: cloneData.platform,
          authorization: cloneData.authorization,
          data: {
            is_massship: false,
            _uid: cloneData.data._uid,
            shop_id: cloneData.data.shop_id,
            buyer_id: cloneData.data.to_id,
            page: 1,
            per_page: 200
          },
          not_show_message: true
        }
        return obj
      },
      // 用户信息创建参数
      createAccountData() {
        const cloneData = this.productOption
        const obj = {
          platform: cloneData.platform,
          authorization: cloneData.authorization,
          data: {
            _uid: cloneData.data._uid,
            shop_id: cloneData.data.shop_id,
            id: cloneData.data.to_id + ''
          },
          not_show_message: true
        }
        return obj
      },
      initData() {
        this.orderList = []
        this.userCount = {}
        this.userinfo = {}
        this.activeName = 'order'
        this.orderActice = 'all'
      }
    },
    watch: {
      productOption: {
        deep: true,
        immediate: true,
        handler(val) {
          // 不是定时请求重置数据并请求
          if (JSON.stringify(val) !== '{}' && !this.intervalRead) {
            this.initData()
            this.getOrderInfo()
            this.getAccountInfo()
            this.getBuyerInfo()
          }
          // 定时请求悄悄的请求
          if (JSON.stringify(val) !== '{}' && this.intervalRead) {
            this.getOrderInfo()
            this.getAccountInfo()
            this.getBuyerInfo()
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
  .order-page {
    height: 100%;
  }
  .user-box {
    overflow: auto;
    padding: 20px 20px 5px 35px;
    font-size: 12px;
    border-bottom: 1px solid #e1e1e1;
    .user-top {
      position: relative;
      font-size: 18px;
      .triangle {
        position: absolute;
        top: -5px;
        left: -34px;
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
    }
  }
  .order-card-box {
    height: 500px;
    overflow-y: auto;
  }
  .no-order-box {
    width: 100px;
    height: 100px;
    text-align:center;
    color: #ccc;
    font-size: 14px;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    left: 0;
    right: 0;
  }
</style>
