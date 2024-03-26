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
 * 現場別年別稼働売上集計ドキュメントモデル
 */
class SiteYearlySales {
  #siteId
  #year
  #docRef
  constructor(siteId, year) {
    this.#siteId = siteId
    this.#year = year
    this.#docRef = firestore.doc(`Sites/${siteId}/SiteYearlySales/${year}`)
    this.sales = JSON.parse(JSON.stringify(salesDefault))
    this.workers = JSON.parse(JSON.stringify(workersDefault))
    this.customerId = ''
  }

  async set() {
    await this.#docRef.set({ year: this.#year, siteId: this.#siteId, ...this })
  }

  async del() {
    await this.#docRef.delete()
  }
}

/**
 * 現場別年別売上稼働集計（SiteYearlySales）ドキュメントを更新します。
 * @param {string} siteId 更新対象の現場id
 * @param {string} year 更新対象年
 */
const sync = async (siteId, year) => {
  const model = new SiteYearlySales(siteId, year)
  const colRef = firestore.collection(`Sites/${siteId}/SiteMonthlySales`)
  const query = colRef.where('siteId', '==', siteId).where('year', '==', year)
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
