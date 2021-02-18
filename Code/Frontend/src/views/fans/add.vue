<template>
  <div v-loading="totalLoading">
    <div class="header-box fen-header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="siteCodeList"
        class="demo-form-inline"
        size="mini"
      >
        <el-form-item label="站点账号">
          <el-cascader
            v-model="siteCodeList.siteAccount"
            placeholder="请选择站点账号"
            :options="siteCodeList.options_account"
            filterable
            @change="fanStorageListInfo"
            :props="siteAccountConfig"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="content-box fan-content-box">
      <el-row>
        <el-col :span="24">
          <div class="fem">
            <svg-icon
              class="my_account"
              icon-class="fans_follow"
            />
            <div class="follow">
              我的关注 <span :class="{warning: fanStorage.status_count.attention === 5000, success: fanStorage.status_count.attention < 5000 }">{{ fanStorage.status_count.attention }}</span>
            </div>
            <!--<el-button class="fem-btn" size="mini" type="danger" plain round @click="fenStorageOperate">全部取关</el-button>-->
          </div>
        </el-col>
      </el-row>
      <div class="store_my_box">
        <div class="item_box">
          <div class="title">
            店铺粉丝
          </div>
          <div class="fan-box">
            <div class="header-box">
              <el-row :gutter="20">
                <el-col :span="4">
                  <div
                    class="label"
                    style="top: 5px;position: relative;font-size: 14px;text-align: right"
                  >
                    店铺
                  </div>
                </el-col>
                <el-col
                  :span="14"
                  :class="{'input-warning': storeWarning.show}"
                >
                  <!--<el-select size="mini" v-model="storeFansQuery.url" filterable placeholder="请输入要搜索的店铺地址" style="width:100% !important;"-->
                  <!--no-data-text="暂无数据" no-match-text="请到粉丝采集中采集此店铺粉丝数据" clearable @clear="clearStoreList">-->
                  <!--<el-option-->
                  <!--v-for="(item, key) in account_list"-->
                  <!--:key="key"-->
                  <!--:label="item.domain"-->
                  <!--:value="item.domain">-->
                  <!--</el-option>-->
                  <!--</el-select>-->
                  <el-input
                    size="mini"
                    v-model="storeFansQuery.url"
                    placeholder="请输入要搜索的店铺地址"
                    @blur="inputBlur"
                    clearable
                    @clear="clearStoreList"
                  />
                  <span
                    v-show="storeWarning.show"
                    class="warning"
                  >{{ storeWarning.text }}</span>
                </el-col>
                <el-col :span="6">
                  <el-button
                    class="fem-item"
                    size="mini"
                    type="primary"
                    @click="seachStoreFans"
                    :disabled="storeLoading"
                  >
                    获取粉丝
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <div
              v-loading="storeLoading"
              element-loading-text="粉丝数据加载中"
            >
              <div class="content-box">
                <div
                  class="list"
                  v-for="(fan, key) in stoteFansList.list"
                  :key="key"
                  v-show="stoteFansList.list.length > 0"
                >
                  {{ fan.follower_username }}
                </div>
                <!--<el-checkbox-group v-model="storeFansCheck" class="list" @change="checkStoreFans" v-show="stoteFansList.list.length > 0">-->
                <!--&lt;!&ndash;<el-checkbox v-for="(fan, key) in stoteFansList.list" :key="key" :label="fan.id">{{ fan.name }}</el-checkbox>&ndash;&gt;-->
                <!--</el-checkbox-group>-->
                <div
                  v-show="stoteFansList.list.length === 0 && !storeLoading"
                  class="no_data"
                >
                  <svg-icon
                    class="no_data_icon"
                    icon-class="no_data"
                  />
                  <span>暂无粉丝数据</span>
                </div>
              </div>
            </div>
            <div class="content-bottom">
              <!--:current-page = "storeFansQuery.page"-->
              <el-pagination
                :current-page="stoteFansList.pagination.page"
                @current-change="gainStoreFans"
                :page-size="storeFansQuery.per_page"
                small
                layout="total, prev, pager, next, jumper"
                :total="stoteFansList.pagination.total"
              />
              <div
                class="bottom-btn"
                style="flex-direction:row-reverse"
              >
                <!--<el-checkbox v-model="fenCheckAll" @change="allStorageFans" :disabled="stoteFansList.total === 0">全部</el-checkbox>-->
                <!--<el-button type="text" class="button fan_btn" @click="addMyStorage" :disabled="!(fenCheckAll || storeFansCheck.length > 0)">一键加入粉丝库</el-button>-->
                <el-button
                  type="text"
                  class="button fan_btn"
                  @click="addMyStorage"
                  :disabled="stoteFansList.pagination.total === 0 || storeLoading"
                  v-permission="permission.storeAdd"
                >
                  一键加入粉丝库
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="item_box">
          <div
            class="item_mask"
            v-show="fanMask"
          />
          <div class="title">
            我的粉丝库
          </div>
          <div class="fan-box">
            <div class="header-box">
              <el-radio-group
                v-model="fanStorageQuery.status"
                size="mini"
                class="fen-checkbox"
                @change="changeFanStatus"
              >
                <el-radio-button
                  size="medium"
                  :label="ATTENTION_STATUS.NOTCONERN"
                >
                  未关注粉丝（{{ fanStorage.status_count.notAttention }}）
                </el-radio-button>
                <el-radio-button
                  size="medium"
                  :label="ATTENTION_STATUS.CONCERN"
                >
                  已关注粉丝（<span :style="{color: fanStorage.concern === 5000 ? '#F56C6C':''}">{{ fanStorage.status_count.attention }}</span>）
                </el-radio-button>
                <el-radio-button
                  size="medium"
                  :label="ATTENTION_STATUS.CANCEL"
                >
                  已取消关注粉丝（{{ fanStorage.status_count.cancel }}）
                </el-radio-button>
              </el-radio-group>
            </div>
            <div
              v-loading="myFansLoading"
              element-loading-text="粉丝数据加载中"
            >
              <div class="content-box">
                <el-checkbox-group
                  v-model="myFansCheck"
                  class="list"
                  @change="fanStorageCheck"
                  v-show="fanStorage.list.length > 0"
                >
                  <!--未关注-->
                  <el-checkbox
                    v-if="fanStorageQuery.status === ATTENTION_STATUS.NOTCONERN "
                    v-for="(fan, key) in fanStorage.list"
                    :key="key"
                    :label="key"
                    :disabled="fan.execute === 1"
                  >
                    <span class="fan_name">{{ fan.follower_username }}</span>
                    <span
                      v-show="fan.execute === 1"
                      class="focus"
                    >关注中...</span>
                  </el-checkbox>
                  <!--已关注-->
                  <el-checkbox
                    v-if="fanStorageQuery.status === ATTENTION_STATUS.CONCERN "
                    v-for="(fan, key) in fanStorage.list"
                    :key="key"
                    :label="key"
                    :disabled="fan.execute === 1"
                  >
                    <span class="fan_name">{{ fan.follower_username }}</span>
                    <span
                      v-show="fan.execute === 1"
                      class="focus"
                    > 取关中...</span>
                  </el-checkbox>
                  <!--已取消-->
                  <el-checkbox
                    v-if="fanStorageQuery.status === ATTENTION_STATUS.CANCEL "
                    v-for="(fan, key) in fanStorage.list"
                    :key="key"
                    :label="key"
                    :disabled="fan.execute === 1"
                  >
                    <span class="fan_name">{{ fan.follower_username }}</span>
                    <span
                      v-show="fan.execute === 1"
                      class="focus"
                    >关注中...</span>
                  </el-checkbox>
                </el-checkbox-group>
                <div
                  v-show="fanStorage.list.length === 0 && !myFansLoading"
                  class="no_data"
                >
                  <svg-icon
                    class="no_data_icon"
                    icon-class="no_data"
                  />
                  <span>暂无粉丝数据</span>
                </div>
              </div>
            </div>
            <div class="content-bottom">
              <el-pagination
                layout="total, sizes, prev, pager, next"
                small
                @size-change="handleSizeChange"
                @current-change="fanStorageList"
                :current-page="fanStorage.pagination.page"
                :page-sizes="[50, 100, 200, 500]"
                :page-size="fanStorageQuery.per_page"
                :total="fanStorage.pagination.total"
              />
              <div class="bottom-btn">
                <el-checkbox
                  v-model="myFansCheckAll"
                  @change="fanStorageChangeAll"
                  :disabled="fanStorage.pagination.total === 0 || fanStorage.list.length === fanStorage.noCheckTotal"
                  v-permission="[permission.addCancelConcern, permission.deleteFans]"
                >
                  全选 <span style="padding-left:5px; color:#F56C6C; font-size:12px;">仅当前页面</span>
                </el-checkbox>
                <div>
                  <el-button
                    type="text"
                    class="fan_btn"
                    v-show="fanStorageQuery.status === ATTENTION_STATUS.NOTCONERN"
                    :disabled="myFansCheck.length === 0 || myFansLoading"
                    @click="fenStorageOperate('add')"
                    v-permission="permission.addCancelConcern"
                  >
                    添加关注
                  </el-button>
                  <el-button
                    type="text"
                    class="fan_btn"
                    v-show="fanStorageQuery.status === ATTENTION_STATUS.CONCERN"
                    :disabled="myFansCheck.length === 0 || myFansLoading"
                    @click="fenStorageOperate('cancel')"
                    v-permission="permission.addCancelConcern"
                  >
                    取消关注
                  </el-button>
                  <el-button
                    type="text"
                    class="fan_btn"
                    v-show="fanStorageQuery.status === ATTENTION_STATUS.CANCEL"
                    :disabled="myFansCheck.length === 0 || myFansLoading"
                    @click="fenStorageOperate('replace')"
                    v-permission="permission.addCancelConcern"
                  >
                    重新关注
                  </el-button>
                  <el-button
                    type="text"
                    class="fan_btn btn_danger"
                    :class="{ 'btn_danger': myFansCheck.length > 0 }"
                    v-show="fanStorageQuery.status === ATTENTION_STATUS.CANCEL"
                    :disabled="myFansCheck.length === 0 || myFansLoading"
                    @click="fenStorageOperate('delete')"
                    v-permission="permission.deleteFans"
                  >
                    删除粉丝
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { fetchAccountList } from '@/api/chat'
  import { fetchStorageNoAttention, fetchStorageAttention, fetchStoreFans, fetchAddFanStorage, fetchAddOrCancelAttention, fetchDeleteFans } from '@/api/fans'
  import store from '@/store'
  const status_static = {
    NOTCONERN: '1',
    CONCERN: '20',
    CANCEL: '30'
  }
  export default {
    name: 'Add',
    data() {
      return {
        permission: {
          storeAdd: 'operation.follower.follower.add-follow-lib', // 一键加入
          addCancelConcern: 'operation.follower.follower.follow-fans', // 关注
          deleteFans: 'operation.follower.follower.delete-fans' // 删除粉丝
        },
        // check_permission: {
        //   concern: false,
        //   delete: false
        // },
        // 关注状态(常量）
        ATTENTION_STATUS: status_static,
        // 整体loading
        totalLoading: false,
        // 站点账号配置
        siteAccountConfig: {
          label: 'account',
          value: 'id',
          children: 'child'
        },
        // 站点账号查询
        siteCodeList: {
          siteAccount: [],
          options_account: [],
          shop_id: 0
        },
        // 域名list
        domainList: {},
        /**
         * 我的粉丝库
         */
        // 我的粉丝库遮罩
        fanMask: false,
        // loading
        myFansLoading: false,
        // list数据
        fanStorage: {
          status_count: {
            notAttention: 0, // 未关注
            attention: 0, // 已关注
            cancel: 0 // 已取消
          },
          list: [],
          noCheckTotal: 0,
          pagination: {
            page: 1,
            total: 0
          }
        },
        // 请求参数
        fanStorageQuery: {
          page: 1,
          per_page: 50,
          status: status_static.NOTCONERN,
          site_code: '',
          shop_id: 0
        },
        // checkbox 为true是list id
        myFansCheck: [],
        // 全选是否点击
        myFansCheckAll: false,
        /**
         * 店铺粉丝
         */
        // loading
        storeLoading: false,
        // 搜索框 匹配该站点domain正则
        storeDomain: '',
        // 搜索框 warning状态时报错信息
        storeWarning: {
          show: false,
          text: ''
        },
        // list数据
        stoteFansList: {
          list: [],
          pagination: {
            total: 0,
            page: 1
          }
        },
        // 请求参数
        storeFansQuery: {
          site_code: '',
          url: '',
          // create_user_id: store.getters.userInfo.id,
          page: 1,
          per_page: 1000
        }
      }
    },
    created() {
      this.fetchAccountList()
    // this.checkboxPermission()
    },
    mounted() {
    },
    methods: {
      // // 关注删除 checkbox 权限
      // checkboxPermission() {
      //   const permissions = store.getters && store.getters.permissions
      //   const checkPermission = (permission) => {
      //     let disabledVal
      //     const factor = this._.findKey(permissions, o => {
      //       return o.tag === permission && o.enable === true
      //     })
      //     console.log(factor)
      //     console.log(permission)
      //     if (factor) {
      //       disabledVal = false
      //     } else {
      //       disabledVal = true
      //     }
      //     console.log(disabledVal)
      //     return disabledVal
      //   }
      //   this.check_permission.concern = checkPermission(this.permission.addCancelConcern)
      //   this.check_permission.delete = checkPermission(this.permission.deleteFans)
      // },
      // 站点和账号列表(获取以及初始化时input框中数据配置)
      fetchAccountList() {
        // 全局loading打开
        this.totalLoading = true
        // 方法开始
        const params = {
          user_id: store.getters.userInfo.id
        }
        fetchAccountList(params).then(response => {
          // 重组站点账号下拉框
          if (response.data.length > 0) {
            const site_option_account = []
            response.data.forEach(site_code => {
              const children = []
              site_code.child.forEach(account => {
                children.push({ id: account.shop_id, account: account.account })
                this._.set(this.domainList, account.shop_id, account.domain)
              })
              site_option_account.push({ id: site_code.account, account: site_code.account, child: children })
            })
            this.siteCodeList.options_account = site_option_account
            // 页面进入两种方式
            if (this.$route.query.site_code && this.$route.query.id) {
              // url中待参数
              this.siteCodeList.siteAccount = [this.$route.query.site_code, this.$route.query.id]
            } else {
              // 菜单点击进入
              this.siteCodeList.siteAccount = [this.siteCodeList.options_account[0].id, this.siteCodeList.options_account[0].child[0].id]
            }
            this.fanStorageListInfo()
          } else {
            this.$message.warning('该用户没有配置相关shopee站点账号')
          }
        }).then(_ => {}).catch(_ => {
        }).finally(_ => {
          // 全局loading关闭
          this.totalLoading = false
        })
      },
      // 站点账号change
      fanStorageListInfo(val) {
        // 我的粉丝库
        this.fanStorageQuery.site_code = this.siteCodeList.siteAccount[0]
        this.fanStorageQuery.shop_id = this.siteCodeList.siteAccount[1]
        this.fanStorageQuery.status = this.ATTENTION_STATUS.NOTCONERN
        this.changeFanStatus('init')
        // 店铺粉丝
        this.storeFansQuery.site_code = this.siteCodeList.siteAccount[0]
        this.storeDomain = this.domainList[this.siteCodeList.siteAccount[1]]
        this.storeFansQuery.url = ''
        this.clearStoreList()
      },
      /**
       * 我的粉丝库
       */
      // 状态按钮change
      changeFanStatus(type) {
        this.fanStorage.list = []
        this.fanStorage.pagination.total = 0
        this.fanStorage.pagination.page = 1
        if (type === 'init') {
          this.fanStorage.status_count = {
            notAttention: 0, // 未关注
            attention: 0, // 已关注
            cancel: 0 // 已取消
          }
        }
        this.fanStorageList()
      },
      // 全选checkbox
      fanStorageChangeAll() {
        this.fanMask = true
        if (this.myFansCheckAll) {
          this.fanStorage.list.forEach((item, index) => {
            if (item.execute !== 1 && this.myFansCheck.indexOf(index) < 0) {
              this.myFansCheck.push(index)
            }
          })
        } else {
          this.myFansCheck = []
        }
        this.fanMask = false
      },
      // checkbox 点击
      fanStorageCheck() {
        if (this.myFansCheck.length === this.fanStorage.list.length - this.fanStorage.noCheckTotal) {
          this.myFansCheckAll = true
        } else {
          this.myFansCheckAll = false
        }
      },
      // 添加关注，取消关注，重新关注，删除粉丝
      fenStorageOperate(type) {
        this.fanMask = true
        this.myFansLoading = true
        let api = fetchAddOrCancelAttention
        const params = {}
        switch (type) {
        case 'add':
          params.type = 'follow'
          break
        case 'cancel':
          params.type = 'unfollow'
          break
        case 'replace':
          params.type = 'follow'
          break
        case 'delete':
          api = fetchDeleteFans
          break
        }
        if (type === 'add' && (this.fanStorage.status_count.attention + this.myFansCheckAll.length) > 5000) {
          this.$message({
            message: '关注粉丝超过5000人，请先取关部分已关注的粉丝',
            type: 'warning',
            duration: 5000
          })
          this.fanMask = false
          this.myFansLoading = true
        } else {
          const checkIDList = []
          const checkUidList = []
          this.myFansCheck.forEach(index => {
            checkIDList.push(this.fanStorage.list[index].id)
            checkUidList.push(this.fanStorage.list[index].follower_uid)
          })
          if (type === 'delete') {
            params.ids = checkIDList
          } else {
            params.shop_id = this.fanStorageQuery.shop_id
            params.follower_uids = checkUidList
          }
          api(params).then(res => {
            this.fanMask = false
            this.myFansLoading = false
            this.fanStorageList(this.fanStorage.pagination.page)
          }).catch(error => {
            this.fanMask = false
            this.myFansLoading = false
            console.log(error)
          })
        }
      },
      // 分页
      handleSizeChange(val) {
        this.fanStorageQuery.per_page = val
        this.fanStorageList()
      },
      // 后端联调
      fanStorageList(page = 1) {
        this.myFansCheck = []
        this.myFansCheckAll = false
        this.fanStorageQuery.page = page
        this.fanStorage.list = []
        this.fanStorage.noCheckTotal = 0
        this.myFansLoading = true
        const api = this.fanStorageQuery.status === this.ATTENTION_STATUS.NOTCONERN ? fetchStorageNoAttention : fetchStorageAttention
        api(this.fanStorageQuery).then(response => {
          this.fanStorage = response.data
          this.fanStorage.noCheckTotal = this._.filter(this.fanStorage.list, ['execute', 1]).length
        }).finally(_ => {
          this.myFansLoading = false
        })
      },
      /**
       * 我的粉丝库
       */
      // 搜索框input 离开
      inputBlur() {
        this.storeFansQuery.url = this._.trim(this.storeFansQuery.url)
        if (this.storeFansQuery.url) {
          const regDomain = new RegExp('^' + this.storeDomain)
          if (regDomain.test(this.storeFansQuery.url)) {
            this.storeWarning = {
              show: false,
              text: ''
            }
          } else {
            this.storeWarning = {
              show: true,
              text: '店铺地址须以' + this.storeDomain + '开头'
            }
          }
        } else {
          this.storeWarning = {
            show: true,
            text: '店铺地址不能为空'
          }
          this.storeFansQuery.url = ''
        }
      },
      // 获取店铺URL列表
      // 店铺粉丝 domain list
      // fetchStoreList() {
      //   this.account_list = []
      //   const params = {
      //     site_code: this.storeFansQuery.site_code
      //   }
      //   fetchStoreUrl(params).then(res => {
      //     this.account_list = res.data.list
      //   })
      // },
      // 搜索
      seachStoreFans() {
        if (this._.trim(this.storeFansQuery.url)) {
          if (!this.storeWarning.show) {
            this.fenCheckAll = false
            this.gainStoreFans()
          }
        } else {
          this.storeWarning = {
            show: true,
            text: '店铺地址不能为空'
          }
          this.storeFansQuery.url = ''
        }
      },
      // 清空
      clearStoreList() {
        this.stoteFansList = { ids: [], list: [], pagination: { total: 0, page: 1 }}
        this.storeFansQuery.page = 1
        this.storeWarning = { show: false, text: '' }
      // this.fenCheckAll = false
      // this.storeFansCheck = []
      },
      // 一键加入
      addMyStorage() {
        const params = {
          url: this.storeFansQuery.url
        }
        fetchAddFanStorage(params).then(response => {
          this.storeFansQuery.url = ''
          this.clearStoreList()
          this.changeFanStatus()
        }).catch(err => {
          console.log(err)
        })
      },
      // list 后端数据联调
      gainStoreFans(page = 1) {
        this.storeFansQuery.page = page
        this.stoteFansList.ids = []
        this.stoteFansList.list = []
        // this.storeFansCheck = []
        this.storeLoading = true
        fetchStoreFans(this.storeFansQuery).then(response => {
          this.stoteFansList = response.data
          this.storeLoading = false
        }).catch(_ => {
          this.storeLoading = false
        })
      }
    // 店铺粉丝，点击全部时操作
    // allStorageFans() {
    //   if (this.fenCheckAll) {
    //     const checkAll = []
    //     this.stoteFansList.list.forEach(item => { checkAll.push(item.id) })
    //     this.storeFansCheck = checkAll
    //   } else {
    //     this.storeFansCheck = []
    //   }
    // },
    // 店铺粉丝，点击列表操作
    // checkStoreFans() {
    //   if (this.storeFansCheck.length === this.stoteFansList.total) {
    //     this.fenCheckAll = true
    //   } else if (this.storeFansCheck.length < this.stoteFansList.list.length) {
    //     this.fenCheckAll = false
    //   }
    // },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .fen-header-box {
    margin-bottom: 0
  }
  .fan-content-box {
    min-width:1000px;
    padding-top: 0;
    .fem {
      display: flex;
      background-color: #f2f2f2;
      height: 74px;
      padding: 21px 15px;
      .my_account {
        font-size: 29px;
        color: #E6A23C;
      }
      .follow {
        padding:0 25px 0 20px;
        line-height: 32px;
        font-size: 14px;
        color:#606266;
        font-weight: bold;
        span{
          padding-left:5px;
          font-style: italic;
          font-size:18px;
          &.warning {
            color: #F56C6C;
          }
          &.success {
            color: #67c23a;
          }
        }
      }
      .fem-btn {
        height: 26px;
        margin: 2px 0;
      }
    }
    .store_my_box {
      display: flex;
      max-width: 1400px;
      .item_box {
        &:first-child{
          margin-right: 25px;
        }
        flex:1;
        position: relative;
        .item_mask {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: transparent;
          z-index: 10;
        }
        .title {
          text-align: center;
          font-size: 16px;
          height: 30px;
          line-height: 30px;
          margin:10px 0;
        }
        .fan-box {
          border: 1px solid #EBEEF5;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
          color: #606266;
          .header-box {
            padding: 15px 0 20px;
            margin: 0;
            .fen-checkbox {
              padding-left:15px;
              display:flex;
              flex-wrap:nowrap;
            }
            .input-warning {
              position: relative;
              .warning {
                position: absolute;
                bottom: -15px;
                left: 10px;
                color: #F56C6C;
                font-size: 12px;
              }
            }
          }
          .content-box {
            padding: 10px 20px;
            height: 500px;
            overflow: auto;
            .list {
              padding-left: 10px;
              line-height: 32px;
              font-size: 14px;
              .fan_name {
                display: inline-block;
                width: 250px;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
                vertical-align: middle;
              }
              .focus {
                padding-left: 5px;
                font-size: 12px;
                font-style: italic;
                font-weight: bold;
                color: #F56C6C;
              }
            }
            .no_data {
              margin: 80px auto;
              width: 100px;
              .no_data_icon {
                font-size: 80px;
              }
              span {
                font-size: 12px;
                display: block;
              }
            }
            &::-webkit-scrollbar-track-piece {
              background-color: #f8f8f8;
            }
            //滚动条的宽度
            &::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            //滚动条的设置
            &::-webkit-scrollbar-thumb {
              background-color: #dddddd;
              background-clip: padding-box;
              min-height: 28px;
            }
            &::-webkit-scrollbar-thumb:hover {
              background-color: #bbb;
            }
          }
          .content-bottom {
            padding: 10px 20px 0;
            .bottom-btn {
              padding-left: 10px;
              display:flex;
              justify-content: space-between;
              align-items: center;
              .fan_btn {
                font-weight: bold;
              }
              .btn_danger {
                color: #f56c6c;
              }
              .btn_success {
                color:#67c23a
              }
            }
          }
        }
      }
    }
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .fan-box {
    .content-box {
      .el-checkbox {
        display:block;
      }
    }
    .input-warning input {
        border: 1px solid #F56C6C;
    }
    .content-bottom .el-pagination .el-select .el-input .el-input__inner {
      height: 22px;
    }
  }

</style>

