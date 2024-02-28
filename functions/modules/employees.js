/* NO USE */
const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { info } = require('firebase-functions/logger')
const firestore = getFirestore()

exports.onCreate = onDocumentCreated('Employees/{docId}', async (event) => {
  info(`[employees.js] A document of Employees collection has been created.`)
  await syncEmployeesInformation()
})

exports.onUpdate = onDocumentUpdated('Employees/{docId}', async (event) => {
  info(`[employees.js] A document of Employees collection has been updated.`)
  info({ before: event.data.before.data(), after: event.data.after.data() })
  await syncEmployeesInformation()
})

exports.onDelete = onDocumentDeleted('Employees/{docId}', async (event) => {
  info(`[employees.js] A document of Employees collection has been deleted.`)
  await syncEmployeesInformation()
})

async function syncEmployeesInformation() {
  info(
    `[employees.js] Start synchronization to the 'Informations/Employees' document.`
  )
  const model = {
    gender: {
      male: 0,
      female: 0,
    },
    contract: {
      'full-time': 0,
      contract: 0,
      'part-timer': 0,
    },
  }
  const colRef = firestore.collection('Employees')
  const querySnapshot = await colRef.get()
  model.gender.male = querySnapshot.docs
    .map((doc) => doc.data())
    .filter(({ gender }) => gender === 'male')
    .filter(({ status }) => status === 'active').length
  model.gender.female = querySnapshot.docs
    .map((doc) => doc.data())
    .filter(({ gender }) => gender === 'female')
    .filter(({ status }) => status === 'active').length
  await firestore.collection('Informations').doc('Employees').set(model)
  info(
    `[employees.js] Synchronization to the 'Informations/Employees' document has been completed.`
  )
}
