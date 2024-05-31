const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.onCreate = onDocumentCreated(
  'LeaveApplications/{docId}',
  async (event) => {
    const data = event.data.data()
    if (data.status === 'approved') {
      const employeeId = data.employeeId
      const batchArray = []
      data.dates.forEach((date, index) => {
        if (index === 0 || index % 500 === 0) {
          batchArray.push(firestore.batch())
        }
        const docRef = firestore.doc(
          `Employees/${employeeId}/EmployeeLeaveApplications/${date}`
        )
        batchArray[batchArray.length - 1].set(docRef, data)
      })
      await Promise.all(batchArray.map(async (batch) => await batch.commit()))
    }
  }
)

exports.onUpdate = onDocumentUpdated(
  'LeaveApplications/{docId}',
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()
    const batchArray = []
    if (before.status === 'approved') {
      before.dates.forEach((date, index) => {
        if (index === 0 || index % 500 === 0) {
          batchArray.push(firestore.batch())
        }
        const docRef = firestore.doc(
          `Employees/${before.employeeId}/EmployeeLeaveApplications/${date}`
        )
        batchArray[batchArray.length - 1].delete(docRef)
      })
      await Promise.all(batchArray.map(async (batch) => await batch.commit()))
    }
    batchArray.splice(0)
    if (after.status === 'approved') {
      after.dates.forEach((date, index) => {
        if (index === 0 || index % 500 === 0) {
          batchArray.push(firestore.batch())
        }
        const docRef = firestore.doc(
          `Employees/${after.employeeId}/EmployeeLeaveApplications/${date}`
        )
        batchArray[batchArray.length - 1].set(docRef, after)
      })
      await Promise.all(batchArray.map(async (batch) => await batch.commit()))
    }
  }
)

exports.onDelete = onDocumentDeleted(
  'LeaveApplications/{docId}',
  async (event) => {
    const data = event.data.data()
    if (data.status === 'approved') {
      const batchArray = []
      data.dates.forEach((date, index) => {
        if (index === 0 || index % 500 === 0) {
          batchArray.push(firestore.batch())
        }
        const docRef = firestore.doc(
          `Employees/${data.employeeId}/EmployeeLeaveApplications/${date}`
        )
        batchArray[batchArray.length - 1].delete(docRef)
      })
      await Promise.all(batchArray.map(async (batch) => await batch.commit()))
    }
  }
)
