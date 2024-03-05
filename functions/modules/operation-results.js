const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { isDocumentChanged } = require('./utils')
const firestore = getFirestore()

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
    if (isDocumentChanged(event, ['site.docId', 'date', 'sales'])) {
      promises.push(syncSiteDaylySales(before.site.docId, before.date))
      promises.push(syncSiteDaylySales(after.site.docId, after.date))
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
  const colRef = firestore.collection('OperationResults')
  const query = colRef
    .where('site.docId', '==', siteId)
    .where('date', '==', date)
  const querySnapshot = await query.get()
  const total = querySnapshot.docs.reduce((sum, i) => sum + i.data().sales, 0)
  const month = date.substring(0, 7)
  const year = date.substring(0, 4)
  const docRef = firestore.doc(`Sites/${siteId}/SiteDaylySales/${date}`)
  total ? await docRef.set({ year, month, date, total }) : await docRef.delete()
}
