const { getFirestore } = require('firebase-admin/firestore')
const {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore')
const firestore = getFirestore()

const BATCH_SIZE = 500

const childData = (data, date) => {
  return {
    docId: date,
    date,
    workShift: data.workShift,
    start: data.start,
    end: data.end,
    numberOfWorkers: data.numberOfWorkers,
    qualification: data.qualification,
    month: date.substring(0, 7),
    status: 'accepted',
    parent: data,
    createAt: data.createAt,
    createDate: data.createDate,
    updateAt: data.updateAt,
    updateDate: data.updateDate,
    uid: data.uid,
  }
}

exports.onCreate = onDocumentCreated(
  'TemporarySites/{docId}',
  async (event) => {
    const data = event.data.data()
    const collectionId = `TemporarySites/${data.docId}/TemporarySiteSchedules`
    const batchArray = []
    data.dates.forEach((date, index) => {
      if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
      const docRef = firestore.doc(`${collectionId}/${date}`)
      batchArray[batchArray.length - 1].set(docRef, childData(data, date))
    })
    await Promise.all(batchArray.map((batch) => batch.commit()))
  }
)

exports.onUpdate = onDocumentUpdated(
  'TemporarySites/{docId}',
  async (event) => {
    const docId = event.params.docId
    const data = event.data.after.data()
    const path = `TemporarySites/${docId}/TemporarySiteSchedules`
    const querySnapshot = await firestore
      .collection(path)
      .where('parent.docId', '==', docId)
      .get()
    const batchArray = []
    const newDates = data.dates.filter((date) => {
      return !querySnapshot.docs.some((doc) => doc.data().date === date)
    })
    newDates.forEach((date, index) => {
      if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
      const docRef = firestore.doc(`${path}/${date}`)
      batchArray[batchArray.length - 1].set(docRef, childData(data, date))
    })
    querySnapshot.docs.forEach((doc, index) => {
      if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
      const date = doc.data().date
      if (data.dates.includes(date)) {
        batchArray[batchArray.length - 1].set(
          doc.ref,
          { parent: data },
          { merge: true }
        )
      } else {
        batchArray[batchArray.length - 1].delete(doc.ref)
      }
    })
    await Promise.all(batchArray.map((batch) => batch.commit()))
  }
)

exports.onDelete = onDocumentDeleted(
  'TemporarySites/{docId}',
  async (event) => {
    const docId = event.params.docId
    const path = `TemporarySites/${docId}/TemporarySiteSchedules`
    const querySnapshot = await firestore
      .collection(path)
      .where('parent.docId', '==', docId)
      .get()
    if (querySnapshot.empty) return
    const batchArray = []
    querySnapshot.docs.forEach((doc, index) => {
      if (index % BATCH_SIZE === 0) batchArray.push(firestore.batch())
      batchArray[batchArray.length - 1].delete(doc.ref)
    })
    await Promise.all(batchArray.map((batch) => batch.commit()))
  }
)
