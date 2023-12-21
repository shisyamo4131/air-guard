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
  leaveApplications: [],
  listeners: {
    index: null,
    placements: null,
    placementDetails: null,
    leaveApplications: null,
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
  /**
   * Returns whether there are duplicate placements of a given employee
   * on the same day and shift.
   * @param {string} date A date of placement.
   * @param {string} workShift 'day' or 'nigiht'
   * @param {string} worker An document-id of employee.
   * @returns
   */
  isDuplicated:
    (state) =>
    ({ date, workShift, worker }) => {
      const workerPlacements = state.placementDetails.filter((item) => {
        if (item.date !== date) return false
        if (item.workShift !== workShift) return false
        if (!item.workers.includes(worker)) return false
        return true
      })
      return workerPlacements.length > 1
    },
  /**
   * Returns whether the specified employee is in a continuous work placement
   * on the specified date.
   * @param {string} date A date of placement.
   * @param {string} worker An document-id of employee.
   * @returns
   */
  isContinuos:
    (state) =>
    ({ date, worker }) => {
      const workerPlacements = state.placementDetails.filter((item) => {
        return item.date === date && item.workers.includes(worker)
      })
      const { day, night } = workerPlacements.reduce((sum, i) => {
        if (i.workShift === 'day') sum.day = (sum?.day || 0) + 1
        if (i.workShift === 'night') sum.night = (sum?.night || 0) + 1
        return sum
      }, {})
      return day > 0 && night > 0
    },
  /**
   * Returns whether or not an approved leave application exists
   * for a given employee on a given date.
   * @param {string} date A date of placement.
   * @param {string} worker An document-id of employee.
   * @returns
   */
  hasLeaveApplication:
    (state) =>
    ({ date, worker }) => {
      const result = state.leaveApplications.some((item) => {
        return item.date === date && item.employeeId === worker
      })
      return result
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
  setLeaveApplications(state, payload) {
    const index = state.leaveApplications.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index === -1) state.leaveApplications.push(payload)
    if (index !== -1) state.leaveApplications.splice(index, 1, payload)
  },
  removeLeaveApplications(state, payload) {
    const index = state.leaveApplications.findIndex(({ docId }) => {
      return docId === payload.docId
    })
    if (index !== -1) state.leaveApplications.splice(index, 1)
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
     * A function to start a subscription to a LeaveApplications documents.
     * @returns A listener to LeaveApplications.
     */
    const subscribeToLeaveApplications = () => {
      const dateCount = this.$dayjs(to).diff(this.$dayjs(from), 'day') + 1
      const dates = [...Array(dateCount)].map((_, i) => {
        return this.$dayjs(from).add(i, 'day').format('YYYY-MM-DD')
      })
      const colRef = collection(this.$firestore, 'LeaveApplications')
      const q = query(
        colRef,
        where('status', '==', 'approved'),
        where('date', 'in', dates)
      )
      const result = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified')
            commit('setLeaveApplications', change.doc.data())
          if (change.type === 'removed')
            commit('removeLeaveApplications', change.doc.data())
        })
      })
      // eslint-disable-next-line
      console.info(
        `[Vuex-placements.js] Subscription to LeaveApplications is now open.`
      )
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
    const leaveApplications = subscribeToLeaveApplications()
    commit('setListener', {
      key: 'leaveApplications',
      value: leaveApplications,
    })
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
