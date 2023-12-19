const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { info } = require('firebase-functions/logger')
const firestore = getFirestore()

/**
 * Runs when the AirGuardCustomers document is updated.
 * Synchronizes with the Customers document that has a matching code.
 */
exports.customerUpdated = onDocumentUpdated(
  'AirGuardCustomers/{code}',
  async (event) => {
    const data = event.data.after.data()
    const colRef = firestore.collection('Customers')
    const q = colRef.where('code', '==', data.code).limit(1)
    const snapshot = await q.get()
    if (snapshot.empty) return
    const docRef = snapshot.docs[0].ref
    await docRef.set(data, { merge: true })
    info('A customer document was updated.', { data: { ...data } })
  }
)

/**
 * Runs when the AirGuardSites document is updated.
 * Synchronizes with the Sites document that has a matching code.
 */
exports.siteUpdated = onDocumentUpdated(
  'AirGuardSites/{code}',
  async (event) => {
    const data = event.data.after.data()
    const colRef = firestore.collection('Sites')
    const q = colRef.where('code', '==', data.code).limit(1)
    const snapshot = await q.get()
    if (snapshot.empty) return
    const docRef = snapshot.docs[0].ref
    await docRef.set(data, { merge: true })
    info('A site document was updated.', { data: { ...data } })
  }
)

/**
 * Runs when the AirGuardEmployees document is updated.
 * Synchronizes with the Employees document that has a matching code.
 */
exports.employeeUpdated = onDocumentUpdated(
  'AirGuardEmployees/{code}',
  async (event) => {
    const data = event.data.after.data()
    const colRef = firestore.collection('Employees')
    const q = colRef.where('code', '==', data.code).limit(1)
    const snapshot = await q.get()
    if (snapshot.empty) return
    const docRef = snapshot.docs[0].ref
    await docRef.set(data, { merge: true })
    info('A employee document was updated.', { data: { ...data } })
  }
)
