const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const SiteDaylySales = require('../models/SiteDaylySales')
const { isDocumentChanged } = require('./utils')

exports.onCreate = onDocumentCreated(
  'OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()
    const promises = []
    promises.push(syncSiteDaylySales(data.site.docId, data.date))
    await Promise.all(promises)
  }
)

exports.onUpdate = onDocumentUpdated(
  'OperationResults/{docId}',
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()
    const promises = []
    if (isDocumentChanged(event, ['site.docId', 'date', 'sales', 'workers'])) {
      promises.push(syncSiteDaylySales(after.site.docId, after.date))
    }
    if (isDocumentChanged(event, ['site.docId', 'date'])) {
      promises.push(syncSiteDaylySales(before.site.docId, before.date))
    }
    await Promise.all(promises)
  }
)

exports.onDelete = onDocumentDeleted(
  'OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()
    const promises = []
    promises.push(syncSiteDaylySales(data.site.docId, data.date))
    await Promise.all(promises)
  }
)

const syncSiteDaylySales = async (siteId, date) => {
  const model = new SiteDaylySales(siteId, date)
  await model.sync()
  // const colRef = firestore.collection('OperationResults')
  // const query = colRef
  //   .where('site.docId', '==', siteId)
  //   .where('date', '==', date)
  // const querySnapshot = await query.get()
  // const year = date.substring(0, 4)
  // const month = date.substring(0, 7)
  // const total = querySnapshot.docs.reduce((sum, i) => sum + i.data().sales, 0)
  // const workers = querySnapshot.docs.reduce(
  //   (sum, i) => {
  //     sum.canceled = sum.canceled + i.data().workers.canceled
  //     sum.half = sum.half + i.data().workers.half
  //     sum.normal = sum.normal + i.data().workers.normal
  //     return sum
  //   },
  //   { canceled: 0, half: 0, normal: 0 }
  // )
  // const workersQualified = querySnapshot.docs.reduce(
  //   (sum, i) => {
  //     sum.canceled = sum.canceled + i.data().workersQualified.canceled
  //     sum.half = sum.half + i.data().workersQualified.half
  //     sum.normal = sum.normal + i.data().workersQualified.normal
  //     return sum
  //   },
  //   { canceled: 0, half: 0, normal: 0 }
  // )
  // const docRef = firestore.doc(`Sites/${siteId}/SiteDaylySales/${date}`)
  // await docRef.set({ year, month, date, total, workers, workersQualified })
}
