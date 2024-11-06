import { database, firestore } from 'air-firebase' // Firebase 初期化と Firestore のインポート
import { ref, onValue, set } from 'firebase/database' // Firebase Realtime Database
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import Site from '~/models/Site'
import SiteContract from '~/models/SiteContract'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'

export const state = () => ({
  data: [], // サイトオーダーの現在のリストを保持
  sites: [], // Firestore の Sites コレクションのデータを配列で保持
  siteContracts: [], // Firestore の SiteContracts コレクションのデータを配列で保持
  siteOperationSchedules: [], // Firestore の SiteOperationSchedules コレクションのデータを配列で保持
  listeners: {
    siteOrder: null,
    siteOperationSchedules: null,
  },
})

export const getters = {
  site: (state) => (siteId) => {
    return state.sites.find(({ docId }) => docId === siteId)
  },
  siteContract:
    (state) =>
    ({ date, siteId, workShift }) => {
      return state.siteContracts
        .filter(
          (contract) =>
            contract.siteId === siteId && contract.workShift === workShift
        )
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // Sort by startDate in descending order
        .find(({ startDate }) => startDate <= date)
    },
  /**
   * 指定された日付、現場、勤務区分の現場稼働予定を返します。
   * - 対象が存在しない場合は undefined を返します。
   * - 存在する場合は SiteOperationSchedule クラスのインスタンスを返します。
   * @param {*} state
   * @returns {SiteOperationSchedule|undefined} 現場稼働予定のインスタンス、または undefined
   */
  siteOperationSchedule:
    (state) =>
    ({ date, siteId, workShift }) => {
      const docId = `${siteId}-${date}-${workShift}`
      return state.siteOperationSchedules.find(
        (schedule) => schedule.docId === docId
      )
    },
}

export const mutations = {
  SET_DATA(state, payload) {
    state.data = payload
  },
  ADD_SITE_CONTRACTS(state, contracts) {
    // ドキュメントIDが重複するものは除外して追加
    contracts.forEach((contract) => {
      const exists = state.siteContracts.some((c) => c.docId === contract.docId)
      if (!exists) {
        state.siteContracts.push(contract)
      }
    })
  },
  ADD_SITES(state, sites) {
    // 重複する siteId を除外して追加
    sites.forEach((site) => {
      const exists = state.sites.some((s) => s.docId === site.docId)
      if (!exists) state.sites.push(site)
    })
  },
  SET_SCHEDULE(state, schedule) {
    const index = state.siteOperationSchedules.findIndex(
      (s) => s.docId === schedule.docId
    )
    if (index < 0) {
      state.siteOperationSchedules.push(schedule)
    } else {
      state.siteOperationSchedules.splice(index, 1, schedule)
    }
  },
  REMOVE_SCHEDULE(state, schedule) {
    const index = state.siteOperationSchedules.findIndex(
      (s) => s.docId === schedule.docId
    )
    if (index !== -1) {
      state.siteOperationSchedules.splice(index, 1)
    }
  },
  RESET_SITE_CONTRACTS(state) {
    state.siteContracts = []
  },
  RESET_SITES(state) {
    state.sites = []
  },
  RESET_SCHEDULES(state) {
    state.siteOperationSchedules = []
  },
  SET_LISTENER(state, { key, listener }) {
    state.listeners[key] = listener
  },
  REMOVE_LISTENERS(state) {
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) state.listeners[key]()
      state.listeners[key] = null
    })
  },
}

export const actions = {
  // リアルタイム更新のサブスクリプションを開始
  subscribe({ dispatch }, { from, to }) {
    try {
      // const dbRef = ref(database, 'Placements/siteOrder')
      // const listener = onValue(dbRef, (snapshot) => {
      //   const data = snapshot.val()
      //   const siteOrder = Array.isArray(data) ? data : []
      //   commit('SET_DATA', siteOrder)

      //   // Firestore から Sites のドキュメントを取得
      //   dispatch('fetchSites', siteOrder)

      //   // Firestore から SiteContracts のドキュメントを取得
      //   dispatch('fetchSiteContracts', siteOrder)
      // })

      // // Firebaseのリスナーを返す（解除するために使用）
      // // return listener
      // commit('SET_LISTENER', { key: 'siteOrder', listener })
      dispatch('subscribeSiteOrder')
      dispatch('subscribeSiteOperationSchedules', { from, to })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe:', error)
      throw new Error('Subscription failed.')
    }
  },

  /**
   * SiteOperationSchedules に対するリアルタイムリスナーをセットします。
   * @param {*} param0
   */
  subscribeSiteOperationSchedules({ commit }, { from, to }) {
    try {
      const instance = new SiteOperationSchedule()
      const colRef = collection(firestore, 'SiteOperationSchedules')
      const queryRef = query(
        colRef,
        where('date', '>=', from),
        where('date', '<=', to)
      ).withConverter(instance.converter())
      const listener = onSnapshot(queryRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') commit('SET_SCHEDULE', change.doc.data())
          if (change.type === 'modified')
            commit('SET_SCHEDULE', change.doc.data())
          if (change.type === 'removed')
            commit('REMOVE_SCHEDULE', change.doc.data())
        })
      })
      commit('SET_LISTENER', { key: 'siteOperationSchedules', listener })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to subscribe to site operation schedule data:',
        error
      )
      throw new Error('Subscription failed due to a firestore error.')
    }
  },

  /**
   * Placements/siteOrder に対するリアルタイムリスナーをセットします。
   * - siteOrder に変更が生じると、fetchSites, fetchSiteContracts を実行します。
   * @param {*} param0
   */
  subscribeSiteOrder({ commit, dispatch }) {
    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      const listener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val()
        const siteOrder = Array.isArray(data) ? data : []
        commit('SET_DATA', siteOrder)

        // Firestore から Sites のドキュメントを取得
        dispatch('fetchSites', siteOrder)

        // Firestore から SiteContracts のドキュメントを取得
        dispatch('fetchSiteContracts', siteOrder)
      })

      // Firebaseのリスナーを返す（解除するために使用）
      // return listener
      commit('SET_LISTENER', { key: 'siteOrder', listener })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to site order data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  },

  // Firestore から SiteContracts を取得
  async fetchSites({ state, commit }, siteOrder) {
    const siteIdsToFetch = siteOrder
      .map((item) => item.siteId)
      .filter((siteId) => !state.sites.some((site) => site.docIdId === siteId)) // 既に取得済みの siteId を除外

    if (siteIdsToFetch.length === 0) return // 新しい siteId がなければ終了

    try {
      const newSites = await new Site().fetchByIds(siteIdsToFetch)
      commit('ADD_SITES', newSites)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch site contracts:', error)
    }
  },

  // Firestore から SiteContracts を取得
  async fetchSiteContracts({ state, commit }, siteOrder) {
    const siteIdsToFetch = siteOrder
      .map((item) => item.siteId)
      .filter(
        (siteId) =>
          !state.siteContracts.some((contract) => contract.siteId === siteId)
      ) // 既に取得済みの siteId を除外

    if (siteIdsToFetch.length === 0) return // 新しい siteId がなければ終了

    try {
      const newContracts = await new SiteContract().fetchBySiteIds(
        siteIdsToFetch
      )
      commit('ADD_SITE_CONTRACTS', newContracts)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch site contracts:', error)
    }
  },

  // リアルタイム更新のサブスクリプションを解除
  unsubscribe({ commit }) {
    try {
      commit('REMOVE_LISTENERS') // リスナーを解除
      commit('SET_DATA', []) // data を空にする
      commit('RESET_SITES') // sites を空にする
      commit('RESET_SITE_CONTRACTS') // siteContracts を空にする
      commit('RESET_SCHEDULES') // siteOperationSchedules を空にする
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from site order data:', error)
    }
  },

  // 新しいサイト/シフトの組み合わせを追加
  async add({ state }, { siteId, workShift }) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      if (!state.data.some((item) => item.id === id)) {
        const updatedIndex = [...state.data, { id, siteId, workShift }]
        const dbRef = ref(database, 'Placements/siteOrder')
        await set(dbRef, updatedIndex)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to add new id "${id}":`, error)
      throw new Error(`Failed to add new id "${id}": ${error.message}`)
    }
  },

  // サイト/シフトの組み合わせを削除
  async remove({ state }, { siteId, workShift }) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      const updatedIndex = state.data.filter((item) => item.id !== id)
      const dbRef = ref(database, 'Placements/siteOrder')
      await set(dbRef, updatedIndex)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to remove id "${id}":`, error)
      throw new Error(`Failed to remove id "${id}": ${error.message}`)
    }
  },

  // サイトオーダーリストを新しい配列で更新
  async update(_, val) {
    if (!Array.isArray(val)) {
      throw new TypeError('Argument "val" must be an array.')
    }

    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      await set(dbRef, val)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update site order list:', error)
      throw new Error(`Failed to update site order list: ${error.message}`)
    }
  },
}
