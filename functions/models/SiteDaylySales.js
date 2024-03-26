const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

module.exports = class SiteDaylySales {
  #siteId
  #date
  constructor(siteId, date) {
    this.#siteId = siteId
    this.#date = date
    this.sales = 0
    this.workers = {
      standard: { normal: 0, half: 0, canceled: 0 },
      qualified: { normal: 0, half: 0, canceled: 0 },
    }
    Object.defineProperties(this, {
      year: {
        enumerable: true,
        get() {
          return this.#date ? this.#date.substring(0, 4) : ''
        },
        set(v) {},
      },
      month: {
        enumerable: true,
        get() {
          return this.#date ? this.#date.substring(0, 7) : ''
        },
        set(v) {},
      },
    })
  }

  async sync() {
    const colRef = firestore.collection('OperationResults')
    const query = colRef
      .where('site.docId', '==', this.#siteId)
      .where('date', '==', this.#date)
    const querySnapshot = await query.get()
    this.sales = querySnapshot.docs.reduce((sum, i) => sum + i.data().sales, 0)
    this.workers = querySnapshot.docs.reduce(
      (sum, doc) => {
        const types = ['standard', 'qualified']
        const workResults = ['normal', 'half', 'canceled']
        types.forEach((type) => {
          workResults.forEach((workResult) => {
            sum[type][workResult] += doc.data().workers[type][workResult]
          })
        })
        return sum
      },
      {
        standard: { normal: 0, half: 0, canceled: 0 },
        qualified: { normal: 0, half: 0, canceled: 0 },
      }
    )
    const docRef = firestore.doc(
      `Sites/${this.#siteId}/SiteDaylySales/${this.#date}`
    )
    await docRef.set({ date: this.#date, siteId: this.#siteId, ...this })
  }
}
