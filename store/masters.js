/* eslint-disable */
import {
  collection,
  collectionGroup,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

export const state = () => ({
  // Customers: [],
  // Sites: [],
  Employees: [],
  listeners: {
    // Customers: null,
    // Sites: null,
    Employees: null,
  },
})

export const getters = {
  // Customer: (state) => (payload) => {
  //   return state.Customers.find(({ docId }) => docId === payload)
  // },
  // CustomerBySiteId: (state, getters) => (payload) => {
  //   const site = getters.Site(payload)
  //   if (!site) return undefined
  //   const customer = getters.Customer(site.customerId)
  //   return customer
  // },
  // Customers: (state) => {
  //   return state.Customers.map((item) => item)
  // },
  Employee: (state) => (payload) => {
    return state.Employees.find(({ docId }) => docId === payload)
  },
  Employees: (state) => {
    return state.Employees.map((item) => item)
  },
  // Site: (state) => (payload) => {
  //   return state.Sites.find(({ docId }) => docId === payload)
  // },
  // Sites: (state) => {
  //   return state.Sites.map((item) => item)
  // },
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
  async fetch(_, { collectionId, search }) {
    console.info(`[masters.js] fetch was called.`)
    console.table({ collectionId, search })
    if (!search) return
    const searchGram = getNgrams(search)
    const wheres = searchGram.map((gram) =>
      where(`tokenMaps.${gram}`, '==', true)
    )
    wheres.push(where('collection', '==', collectionId))
    const colRef = collectionGroup(this.$firestore, `TokenMap`)
    const q = query(colRef, ...wheres)
    const snapshot = await getDocs(q)
    console.info(
      `[masters.js] Found %d document(s) by token-map.`,
      snapshot.docs.length
    )
    if (snapshot.empty) return
    const result = []
    const docRefs = snapshot.docs.map((doc) => doc.data().parent)
    for (const docRef of docRefs) {
      const doc = await getDoc(docRef)
      result.push(doc.data())
    }
    return result
  },
}

function sendError(err) {
  console.error(err)
  alert(err.message)
}

/**
 * Returns an array for N-gram searching.
 * @param {string} value
 */
function getNgrams(search) {
  const gramLength = search.length === 1 ? 1 : 2
  const result = [
    ...new Set(
      Array.from(search).reduce((sum, _, index) => {
        if (index > search.length - gramLength) return sum
        sum.push(search.substring(index, index + gramLength))
        return sum
      }, [])
    ),
  ]
  return result
}
/* eslint-enable */
