import {
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

export const state = () => ({
  index: [],
  placements: [],
  placementDetails: [],
  applications: [],
  listeners: {
    index: null,
    placements: null,
    placementDetails: null,
    applications: null,
  },
})

export const getters = {
  index(state) {
    return state.index.map((item) => item)
  },
  detail:
    (state) =>
    ({ date, siteId, workShift }) => {
      const result = state.placementDetails.find((item) => {
        return (
          item.date === date &&
          item.siteId === siteId &&
          item.workShift === workShift
        )
      })
      return result
    },
  /**
   * Returns an array of siteId-workShift contained in placement-details
   * and not contained in placement-index.
   */
  hiddenIndex(state) {
    const result = state.placementDetails
      .filter(({ workers }) => {
        return workers.length > 0
      })
      .filter(({ siteId, workShift }) => {
        return !state.index.some((item) => {
          return item.siteId === siteId && item.workShift === workShift
        })
      })
    return Array.from(
      new Map(
        result.map(({ siteId, workShift }) => {
          const key = `${siteId}-${workShift}`
          const value = { siteId, workShift }
          return [key, value]
        })
      ).values()
    )
  },
  isDuplicated:
    (state) =>
    ({ date, workShift, worker }) => {
      return (
        state.placementDetails.filter((item) => {
          return (
            item.date === date &&
            item.workShift === workShift &&
            item.workers.includes(worker)
          )
        }).length > 1
      )
    },
  isContinuos:
    (state) =>
    ({ date, worker }) => {
      const day = state.placementDetails.filter((item) => {
        return (
          item.date === date &&
          item.workShift === 'day' &&
          item.workers.includes(worker)
        )
      })
      const night = state.placementDetails.filter((item) => {
        return (
          item.date === date &&
          item.workShift === 'night' &&
          item.workers.includes(worker)
        )
      })
      return day.length > 0 && night.length > 0
    },
  hasApplication:
    (state) =>
    ({ date, worker }) => {
      const result = state.applications.filter((item) => {
        return item.dates.includes(date) && item.employeeId === worker
      })
      return !!result.length
    },
}

export const mutations = {
  setIndex(state, payload) {
    state.index = payload
  },
  setPlacements(state, payload) {
    const index = state.placements.findIndex(
      ({ date }) => date === payload.date
    )
    if (index === -1) state.placements.push(payload)
    if (index !== -1) state.placements.splice(index, 1, payload)
  },
  removePlacements(state, payload) {
    const index = state.placements.findIndex(
      ({ date }) => date === payload.date
    )
    if (index !== -1) state.placements.splice(index, 1)
  },
  setPlacementDetails(state, payload) {
    const index = state.placementDetails.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index === -1) state.placementDetails.push(payload)
    if (index !== -1) state.placementDetails.splice(index, 1, payload)
  },
  removePlacementDetails(state, payload) {
    const index = state.placementDetails.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index !== -1) state.placementDetails.splice(index, 1)
  },
  setApplications(state, payload) {
    const index = state.applications.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index === -1) state.applications.push(payload)
    if (index !== -1) state.applications.splice(index, 1, payload)
  },
  removeApplications(state, payload) {
    const index = state.applications.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index !== -1) state.applications.splice(index, 1)
  },
  setListener(state, { key, value }) {
    state.listeners[key] = value
    if (!value) state[key].splice(0)
  },
}

export const actions = {
  /**
   * An action to subscribe to Placement data.
   * @param {*} from A start-date to subscribe placement data.
   * @param {*} to A end-date to subscribe placement data.
   */
  subscribe({ commit }, { from, to }) {
    /**
     * A function to start a subscription to a Applications documents.
     * @returns A listener to Applications.
     */
    const subscribeToApplications = () => {
      const dateCount = this.$dayjs(to).diff(this.$dayjs(from), 'day') + 1
      const dates = [...Array(dateCount)].map((_, i) => {
        return this.$dayjs(from).add(i, 'day').format('YYYY-MM-DD')
      })
      const colRef = collection(this.$firestore, 'Applications')
      const q = query(
        colRef,
        where('status', '==', 'approved'),
        where('dates', 'array-contains-any', dates)
      )
      const result = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified')
            commit('setApplications', change.doc.data())
          if (change.type === 'removed')
            commit('removeApplications', change.doc.data())
        })
      })
      return result
    }
    /**
     * A function to create placements/index document.
     */
    const createIndexDoc = () => {
      const docRef = doc(this.$firestore, 'Placements/index')
      getDoc(docRef).then((snapshot) => {
        if (snapshot.exists()) return
        setDoc(docRef, { items: [] })
      })
    }
    /**
     * A function to start a subscription to Placements/index.
     * The index document only has an array field named 'items'.
     * This array represents the order of the sites to be displayed in the placement table.
     * @returns A listener to Placements/index.
     */
    const subscribeToIndex = () => {
      const docRef = doc(this.$firestore, `Placements/index`)
      const result = onSnapshot(docRef, (doc) => {
        commit('setIndex', doc.data()?.items || [])
      })
      // eslint-disable-next-line
      console.info(
        `[Vuex-placements.js] Subscription to Placements/index is now open.`
      )
      return result
    }
    /**
     * A function to start a subscription to a Placements documents.
     * @returns A listener to Placements.
     */
    const subscribeToPlacements = () => {
      const colRef = collection(this.$firestore, 'Placements')
      const q = query(
        colRef,
        where('date', '>=', from),
        where('date', '<=', to)
      )
      const result = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified')
            commit('setPlacements', change.doc.data())
          if (change.type === 'removed')
            commit('removePlacements', change.doc.data())
        })
      })
      // eslint-disable-next-line
      console.info(
        `[Vuex-placements.js] Subscription to Placements is now open.`
      )
      return result
    }
    /**
     * A function to start a subscription to a PlacementDetails documents.
     * @returns A listener to PlacementDetails.
     */
    const subscribeToPlacementDetails = () => {
      const colRef = collectionGroup(this.$firestore, 'PlacementDetails')
      const q = query(
        colRef,
        where('date', '>=', from),
        where('date', '<=', to)
      )
      const result = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added')
            commit('setPlacementDetails', change.doc.data())
          if (change.type === 'modified')
            commit('setPlacementDetails', change.doc.data())
          if (change.type === 'removed')
            commit('removePlacementDetails', change.doc.data())
        })
      })
      // eslint-disable-next-line
      console.info(
        `[Vuex-placements.js] Subscription to PlacementDetails is now open.`
      )
      return result
    }
    createIndexDoc()
    const index = subscribeToIndex()
    commit('setListener', { key: 'index', value: index })
    const placements = subscribeToPlacements()
    commit('setListener', { key: 'placements', value: placements })
    const placementDetails = subscribeToPlacementDetails()
    commit('setListener', { key: 'placementDetails', value: placementDetails })
    const applications = subscribeToApplications()
    commit('setListener', { key: 'applications', value: applications })
  },
  /**
   * An action to unsubscribe to Placement data.
   */
  unsubscribe({ state, commit }) {
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) {
        state.listeners[key]()
        // eslint-disable-next-line
        console.info(`[Vuex-placements.js] Unsubscribe to %s.`, key)
      }
      commit('setListener', { key, value: null })
    })
  },
  /**
   * Add hidden-index to placement/index document.
   */
  async addHiddenIndex({ getters }) {
    const items = getters.index.concat(getters.hiddenIndex)
    const docRef = doc(this.$firestore, `Placements/index`)
    await setDoc(docRef, { items })
  },
  /**
   * Add new site-workshift to items in placement/index document.
   */
  async addIndex({ state }, { siteId, workShift }) {
    /* eslint-disable */
    console.info(`[Vuex-placements.js] 'addIndex' is called.`)
    console.table({ siteId, workShift })
    /* eslint-enable */
    const isExist = state.index.some(
      (item) => item.siteId === siteId && item.workShift === workShift
    )
    if (isExist) {
      /* eslint-disable */
      console.warn(`[Vuex-placements.js] Specified index is already exist.`)
      /* eslint-enable */
      throw new Error('既に登録されています。')
    }
    const docRef = doc(this.$firestore, 'Placements/index')
    await updateDoc(docRef, { items: arrayUnion({ siteId, workShift }) })
  },
  /**
   * Update Placement/index document.
   * @param {*} items An array of PlacementIndex.
   */
  updateIndex(_, items) {
    /* eslint-disable */
    console.info(`[Vuex-placements.js] 'updateIndex' is called.`)
    console.table(items)
    /* eslint-enable */
    const docRef = doc(this.$firestore, `Placements/index`)
    setDoc(docRef, { items })
  },
  deleteIndex({ getters }, { siteId, workShift }) {
    /* eslint-disable */
    console.info(`[Vuex-placements.js] 'deleteIndex' is called.`)
    console.table({ siteId, workShift })
    /* eslint-enable */
    const newItems = getters.index.filter((item) => {
      return !(item.siteId === siteId && item.workShift === workShift)
    })
    const docRef = doc(this.$firestore, `Placements/index`)
    setDoc(docRef, { items: newItems })
  },
  /**
   * Update PlacementDetail document.
   * A Placement document will be created if it is not exist.
   * @param {*} item An object of PlacementDetail
   */
  async updatePlacementDetail(
    { state },
    { docId = undefined, date, siteId, workShift, workers }
  ) {
    /* eslint-disable */
    console.info(`[Vuex-placements.js] 'updatePlacementDetail' is called.`)
    console.table({ docId, date, siteId, workShift, workers })
    /* eslint-enable */
    const hasPlacement = state.placements.some((item) => item.date === date)
    if (!hasPlacement) {
      const newItem = { date, operationCount: 0 }
      await setDoc(doc(this.$firestore, `Placements/${date}`), newItem)
    }
    const path = `Placements/${date}/PlacementDetails`
    const colRef = collection(this.$firestore, path)
    const docRef = docId || undefined ? doc(colRef, docId) : doc(colRef)
    setDoc(docRef, { date, siteId, workShift, workers, docId: docRef.id })
  },
}
