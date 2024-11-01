import { database } from 'air-firebase' // Firebase 初期化と Firestore のインポート
import { ref, onValue, set } from 'firebase/database' // Firebase Realtime Database
import SiteContract from '~/models/SiteContract'

export const state = () => ({
  data: [], // サイトオーダーの現在のリストを保持
  siteContracts: [], // Firestore の SiteContracts コレクションのデータを配列で保持
})

export const getters = {
  siteContract:
    (state) =>
    ({ date, siteId, workShift }) => {
      return state.siteContracts
        .filter(
          (contract) =>
            contract.siteId === siteId && contract.workShift === workShift
        )
        .sort((a, b) => b.startDate - a.startDate) // Sort by startDate in descending order
        .find(({ startDate }) => startDate <= date)
    },
}

export const mutations = {
  SET_DATA(state, payload) {
    state.data = payload
  },
  ADD_SITE_CONTRACTS(state, contracts) {
    // 重複する siteId を除外して追加
    contracts.forEach((contract) => {
      const exists = state.siteContracts.some(
        (c) => c.siteId === contract.siteId
      )
      if (!exists) {
        state.siteContracts.push(contract)
      }
    })
  },
  RESET_SITE_CONTRACTS(state) {
    state.siteContracts = []
  },
}

export const actions = {
  // リアルタイム更新のサブスクリプションを開始
  subscribe({ commit, dispatch }) {
    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      const listener = onValue(dbRef, async (snapshot) => {
        const data = snapshot.val()
        const siteOrder = Array.isArray(data) ? data : []
        commit('SET_DATA', siteOrder)

        // Firestore から SiteContracts のドキュメントを取得
        await dispatch('fetchSiteContracts', siteOrder)
      })

      // Firebaseのリスナーを返す（解除するために使用）
      return listener
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to site order data:', error)
      throw new Error('Subscription failed due to a database error.')
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
  unsubscribe({ commit }, listener) {
    try {
      if (listener) listener() // リスナーを解除
      commit('SET_DATA', []) // data を空にする
      commit('RESET_SITE_CONTRACTS') // siteContracts を空にする
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
