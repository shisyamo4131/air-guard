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
const securityTypes = ['traffic', 'jam', 'facility', 'patrol']

/**
 * 現場別月別稼働売上集計ドキュメントモデル
 */
class SiteMonthlySales {
  #siteId
  #month
  #docRef
  constructor(siteId, month) {
    this.#siteId = siteId
    this.#month = month
    this.#docRef = firestore.doc(`Sites/${siteId}/SiteMonthlySales/${month}`)
    this.sales = JSON.parse(JSON.stringify(salesDefault))
    this.workers = JSON.parse(JSON.stringify(workersDefault))
    this.customerId = ''
    Object.defineProperties(this, {
      /* year */
      year: {
        enumerable: true,
        get() {
          return this.#month ? this.#month.substring(0, 4) : ''
        },
        set(v) {},
      },
    })
  }

  async set() {
    await this.#docRef.set({
      month: this.#month,
      siteId: this.#siteId,
      ...this,
    })
  }

  async del() {
    await this.#docRef.delete()
  }
}

/**
 * 現場別月別売上稼働集計（SiteMonthlySales）ドキュメントを更新します。
 * @param {string} siteId 更新対象の現場id
 * @param {string} month 更新対象年月
 */
const sync = async (siteId, month) => {
  const model = new SiteMonthlySales(siteId, month)
  const colRef = firestore.collection(`Sites/${siteId}/SiteDaylySales`)
  const query = colRef.where('siteId', '==', siteId).where('month', '==', month)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) {
    await model.del()
    return
  }
  /* Aggregate sales */
  model.customerId = querySnapshot.docs[0].data().customerId
  model.sales = querySnapshot.docs.reduce((sum, doc) => {
    securityTypes.forEach((securityType) => {
      sum[securityType] += doc.data().sales[securityType]
    })
    return sum
  }, JSON.parse(JSON.stringify(salesDefault)))
  /* Aggregate workers */
  model.workers = querySnapshot.docs.reduce((sum, doc) => {
    const types = ['standard', 'qualified']
    const workResults = ['normal', 'half', 'canceled']
    securityTypes.forEach((securityType) => {
      types.forEach((type) => {
        workResults.forEach((workResult) => {
          sum[securityType][type][workResult] +=
            doc.data().workers[securityType][type][workResult]
        })
      })
    })
    return sum
  }, JSON.parse(JSON.stringify(workersDefault)))
  /* Update document */
  await model.set()
}

module.exports = { sync }
