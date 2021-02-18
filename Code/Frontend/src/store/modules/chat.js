
const state = {
  activeAccount: [],
  noticeAccount: [],
  isNoticeShow: true,
  // 当前界面是否已经出现过504提示
  hasErrorTip: false
}

const mutations = {
  SET_ACTIVE_ACCOUNT: (state, info) => {
    state.activeAccount = info
  },
  SET_NOTICE_ACCOUNT: (state, info) => {
    state.noticeAccount = info
  },
  SET_NOTICE_SHOW: (state, info) => {
    state.isNoticeShow = info
  },
  SET_ERROR_TIP: (state,info) => {
    state.hasErrorTip = info
  }
}

const actions = {
  setNoticeAccount({ commit }, data) {
    commit('SET_NOTICE_ACCOUNT', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

