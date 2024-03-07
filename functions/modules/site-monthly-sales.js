const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.onModify = onDocumentWritten(
  'Sites/{siteId}/SiteMonthlySales/{month}',
  async (event) => {
    const siteId = event.params.siteId
    const year = event.params.month.substring(0, 4)
    const month = event.params.month
    const colRef = firestore.collection(`Sites/${siteId}/SiteMonthlySales`)
    const query = colRef.where('month', '==', month)
    const querySnapshot = await query.get()
    const total = querySnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().total,
      0
    )
    const workers = querySnapshot.docs.reduce(
      (sum, i) => {
        sum.canceled = sum.canceled + i.data().workers.canceled
        sum.half = sum.half + i.data().workers.half
        sum.normal = sum.normal + i.data().workers.normal
        return sum
      },
      { canceled: 0, half: 0, normal: 0 }
    )
    const workersQualified = querySnapshot.docs.reduce(
      (sum, i) => {
        sum.canceled = sum.canceled + i.data().workersQualified.canceled
        sum.half = sum.half + i.data().workersQualified.half
        sum.normal = sum.normal + i.data().workersQualified.normal
        return sum
      },
      { canceled: 0, half: 0, normal: 0 }
    )
    const docRef = firestore.doc(`Sites/${siteId}/SiteYearlySales/${year}`)
    await docRef.set({ year, total, workers, workersQualified })
  }
)
