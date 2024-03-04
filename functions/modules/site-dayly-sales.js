const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.onModify = onDocumentWritten(
  'Sites/{siteId}/SiteDaylySales/{date}',
  async (event) => {
    const siteId = event.params.siteId
    const year = event.params.date.substring(0, 4)
    const month = event.params.date.substring(0, 7)
    const colRef = firestore.collection(`Sites/${siteId}/SiteDaylySales`)
    const query = colRef.where('month', '==', month)
    const querySnapshot = await query.get()
    const total = querySnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().total,
      0
    )
    const docRef = firestore.doc(`Sites/${siteId}/SiteMonthlySales/${month}`)
    total ? await docRef.set({ year, month, total }) : await docRef.delete()
  }
)
