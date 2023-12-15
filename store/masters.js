/* eslint-disable */
import { collection, onSnapshot } from 'firebase/firestore'

export const state = () => ({
  Customers: [],
  Employees: [],
  Sites: [],
  listeners: {
    Customers: null,
    Sites: null,
    Employees: null,
  },
})

export const getters = {
  Customer: (state) => (payload) => {
    return state.Customers.find(({ docId }) => docId === payload)
  },
  CustomerBySiteId: (state, getters) => (payload) => {
    const site = getters.Site(payload)
    if (!site) return undefined
    const customer = getters.Customer(site.customerId)
    return customer
  },
  Customers: (state) => {
    return state.Customers.map((item) => item)
  },
  Employee: (state) => (payload) => {
    return state.Employees.find(({ docId }) => docId === payload)
  },
  Employees: (state) => {
    return state.Employees.map((item) => item)
  },
  Site: (state) => (payload) => {
    return state.Sites.find(({ docId }) => docId === payload)
  },
  Sites: (state) => {
    return state.Sites.map((item) => item)
  },
}

export const mutations = {
  addMaster(state, { collection, data }) {
    if (!collection || !data) return
    const items = state[collection]
    const index = items.findIndex(({ docId }) => docId === data.docId)
    if (index === -1) items.push(data)
    if (index !== -1) items.splice(index, 1, data)
  },
  removeMaster(state, { collection, data }) {
    if (!collection || !data) return
    const items = state[collection]
    const index = items.findIndex(({ docId }) => docId === data.docId)
    if (index !== -1) items.splice(index, 1)
  },
  addListener(state, { collection, listener }) {
    if (!collection || !listener) {
      throw new Error(
        `[Vuex masters.js] Parameter 'collection' and 'listeners' must be specified.`
      )
    }
    if (!(collection in state.listeners)) {
      throw new Error(
        `[Vuex masters.js] The ${collection} collection does not exist.`
      )
    }
    state.listeners[collection] = listener
  },
  removeListener(state, collection) {
    if (!collection) {
      throw new Error(
        `[Vuex masters.js] Parameter 'collection' must be specified.`
      )
    }
    if (!(collection in state.listeners)) {
      throw new Error(
        `[Vuex masters.js] The ${collection} collection does not exist.`
      )
    }
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) state.listeners[key]()
      state[key].splice(0)
    })
  },
}

export const actions = {
  subscribe({ state, commit }) {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(state.listeners).forEach((key) => {
          const colRef = collection(this.$firestore, key)
          const listener = onSnapshot(colRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const type = change.type
              const data = change.doc.data()
              if (type === 'added')
                commit('addMaster', { collection: key, data })
              if (type === 'modified')
                commit('addMaster', { collection: key, data })
              if (type === 'removed')
                commit('removeMaster', { collection: key, data })
            })
          })
          console.info(`[Vuex masters.js] Subscription to %s is now open.`, key)
          commit('addListener', { collection: key, listener })
        })
        resolve()
      } catch (err) {
        sendError(err)
        reject(err.message)
      }
    })
  },
  unsubscribe({ state, commit }) {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(state.listeners).forEach((key) => {
          commit('removeListener', key)
          console.info(`[Vuex masters.js] Unsubscribe to %s.`, key)
        })
        resolve()
      } catch (err) {
        sendError(err)
        reject(err)
      }
    })
  },
}

function sendError(err) {
  // eslint-disable-next-line
  console.error(err)
  alert(err.message)
}
/* eslint-enable */
