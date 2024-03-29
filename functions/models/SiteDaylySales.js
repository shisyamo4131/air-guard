const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

/* Defines default values */
const salesDefault = { traffic: 0, jam: 0, facility: 0, patrol: 0 }
const workersDefault = {
  traffic: {
    standard: { normal: 0, half: 0, canceled: 0 },
    qualified: { normal: 0, half: 0, canceled: 0 },
  },
  jam: {
    standard: { normal: 0, half: 0, canceled: 0 },
    qualified: { normal: 0, half: 0, canceled: 0 },
  },
  facility: {
    standard: { normal: 0, half: 0, canceled: 0 },
    qualified: { normal: 0, half: 0, canceled: 0 },
  },
  patrol: {
    standard: { normal: 0, half: 0, canceled: 0 },
    qualified: { normal: 0, half: 0, canceled: 0 },
  },
}

/**
 * 現場別日別稼働売上集計ドキュメントモデル
 */
class SiteDaylySales {
  #siteId
  #date
  #docRef
  constructor(siteId, date) {
    this.#siteId = siteId
    this.#date = date
    this.#docRef = firestore.doc(`Sites/${siteId}/SiteDaylySales/${date}`)
    this.sales = JSON.parse(JSON.stringify(salesDefault))
    this.workers = JSON.parse(JSON.stringify(workersDefault))
    this.customerId = ''
    Object.defineProperties(this, {
      /* year */
      year: {
        enumerable: true,
        get() {
          return this.#date ? this.#date.substring(0, 4) : ''
        },
        set(v) {},
      },
      /* month */
      month: {
        enumerable: true,
        get() {
          return this.#date ? this.#date.substring(0, 7) : ''
        },
        set(v) {},
      },
    })
  }

  async set() {
    await this.#docRef.set({ date: this.#date, siteId: this.#siteId, ...this })
  }

  async del() {
    await this.#docRef.delete()
  }
}

/**
 * 現場別日別売上稼働集計（SiteDaylySales）ドキュメントを更新します。
 * @param {string} siteId 更新対象の現場id
 * @param {string} date 更新対象日
 */
const sync = async (siteId, date) => {
  const model = new SiteDaylySales(siteId, date)
  const colRef = firestore.collection('OperationResults')
  const query = colRef
    .where('site.docId', '==', siteId)
    .where('date', '==', date)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) {
    await model.del()
    return
  }
  /* Aggregate sales */
  model.customerId = querySnapshot.docs[0].data().site.customer.docId
  model.sales = querySnapshot.docs.reduce((sum, doc) => {
    const securityType = doc.data().securityType
    const sales = doc.data().sales
    sum[securityType] += sales
    return sum
  }, JSON.parse(JSON.stringify(salesDefault)))
  /* Aggregate workers */
  model.workers = querySnapshot.docs.reduce((sum, doc) => {
    const types = ['standard', 'qualified']
    const workResults = ['normal', 'half', 'canceled']
    types.forEach((type) => {
      workResults.forEach((workResult) => {
        const securityType = doc.data().securityType
        const workers = doc.data().workers
        sum[securityType][type][workResult] += workers[type][workResult]
      })
    })
    return sum
  }, JSON.parse(JSON.stringify(workersDefault)))
  /* Update document */
  await model.set()
}

module.exports = { sync }
