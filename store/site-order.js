import { database } from 'air-firebase'
import { ref, onValue, set } from 'firebase/database' // Firebase Realtime Database

export const state = () => ({
  data: [], // サイトオーダーの現在のリストを保持
})

export const mutations = {
  SET_DATA(state, payload) {
    state.data = payload
  },
}

export const actions = {
  // リアルタイム更新のサブスクリプションを開始
  subscribe({ commit }) {
    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      const listener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val()
        commit('SET_DATA', Array.isArray(data) ? data : [])
      })

      // Firebaseのリスナーを返す（解除するために使用）
      return listener
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to site order data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  },

  // リアルタイム更新のサブスクリプションを解除
  unsubscribe(_, listener) {
    try {
      if (listener) listener() // リスナーを解除
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
      // 組み合わせが存在しない場合のみ追加
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
