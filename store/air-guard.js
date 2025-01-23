import { database } from 'air-firebase'
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'

/**
 * Realtime Database の AirGuard ノードに対する Vuex です。
 * - 未同期である AirGuard のマスタデータが存在するかどうかを把握・通知するためのものです。
 * - 将来 Access 版 AirGuard の使用が停止されると不要になります。
 */
export default {
  state: () => ({
    Customers: [],
    Sites: [],
    Employees: [],
    listeners: {}, // リスナー管理用
  }),
  getters: {
    missingDocIdCustomers: (state) => state.Customers,
    missingDocIdSites: (state) => state.Sites,
    missingDocIdEmployees: (state) => state.Employees,
    hasCustomerAlerts: (state) => state.Customers.length > 0,
    hasSiteAlerts: (state) => state.Sites.length > 0,
    hasEmployeeAlerts: (state) => state.Employees.length > 0,
    // グローバルでアラートが存在するか
    hasAnyAlerts: (state, getters) =>
      getters.hasCustomerAlerts ||
      getters.hasSiteAlerts ||
      getters.hasEmployeeAlerts,
  },
  mutations: {
    ADD_DATA(state, { type, data }) {
      if (!state[type]) return
      const index = state[type].findIndex((item) => item.code === data.code)
      if (index === -1) {
        state[type].push(data)
      } else {
        state[type].splice(index, 1, data)
      }
    },
    REMOVE_DATA(state, { type, code }) {
      if (!state[type]) return
      const index = state[type].findIndex((item) => item.code === code)
      if (index !== -1) {
        state[type].splice(index, 1)
      }
    },
    SET_LISTENER(state, { type, listener }) {
      state.listeners[type] = listener
    },
    REMOVE_LISTENER(state, type) {
      if (state.listeners[type]) {
        state.listeners[type]() // Firebase のリスナーを解除
        delete state.listeners[type]
      }
    },
    RESET_STATE(state) {
      state.Customers = []
      state.Sites = []
      state.Employees = []
      state.listeners = {}
    },
  },
  actions: {
    subscribe({ commit }) {
      ;['Customers', 'Sites', 'Employees'].forEach((type) => {
        // `docId` が null のみを抽出するクエリを作成
        const dbRef = ref(database, `AirGuard/${type}`)
        // const queryRef = query(dbRef, orderByChild('docId'), equalTo(null))
        const queryRef = query(dbRef, orderByChild('docId'), equalTo(false))

        // リスナーを設定
        const listener = onChildAdded(queryRef, (snapshot) => {
          const data = snapshot.val()
          const code = snapshot.key

          commit('ADD_DATA', { type, data: { ...data, code } })
        })

        // 変更を監視
        onChildChanged(queryRef, (snapshot) => {
          const data = snapshot.val()
          const code = snapshot.key

          commit('ADD_DATA', { type, data: { ...data, code } })
        })

        // 削除を監視
        onChildRemoved(queryRef, (snapshot) => {
          const code = snapshot.key
          commit('REMOVE_DATA', { type, code })
        })

        commit('SET_LISTENER', { type, listener })
      })
    },
    unsubscribe({ commit, state }) {
      // リスナーを全て解除
      Object.keys(state.listeners).forEach((type) => {
        commit('REMOVE_LISTENER', type)
      })
      // 全データをクリア
      commit('RESET_STATE')
    },
  },
}
