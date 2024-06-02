const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

async function batchSet(data) {
  const collectionId = `Employees/${data.employeeId}/EmployeeLeaveApplications`
  const batchArray = []
  data.dates.forEach((date, index) => {
    if (index % 500 === 0) batchArray.push(firestore.batch())
    const docRef = firestore.doc(`${collectionId}/${date}`)
    const newData = { ...data, docId: date, leaveApplicationId: data.docId }
    batchArray[batchArray.length - 1].set(docRef, newData)
  })
  await Promise.all(batchArray.map((batch) => batch.commit()))
}

async function batchDelete(employeeId, leaveApplicationId) {
  const collectionId = `Employees/${employeeId}/EmployeeLeaveApplications`
  const colRef = firestore.collection(collectionId)
  const query = colRef.where('leaveApplicationId', '==', leaveApplicationId)
  const querySnapshot = await query.get()
  if (querySnapshot.empty) return
  const batchArray = []
  querySnapshot.docs.forEach((doc, index) => {
    if (index % 500 === 0) batchArray.push(firestore.batch())
    batchArray[batchArray.length - 1].delete(doc.ref)
  })
  await Promise.all(batchArray.map((batch) => batch.commit()))
}

exports.onCreate = onDocumentCreated(
  'LeaveApplications/{docId}',
  async (event) => {
    const data = event.data.data()
    if (data.status === 'approved') await batchSet(data)
  }
)

exports.onUpdate = onDocumentUpdated(
  'LeaveApplications/{docId}',
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()
    if (before.status === 'approved')
      await batchDelete(before.employeeId, event.params.docId)
    if (after.status === 'approved') await batchSet(after)
  }
)

exports.onDelete = onDocumentDeleted(
  'LeaveApplications/{docId}',
  async (event) => {
    const data = event.data.data()
    if (data.status === 'approved') {
      await batchDelete(data.employeeId, event.params.docId)
    }
  }
)
