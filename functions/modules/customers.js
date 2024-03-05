const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const firestore = getFirestore()

exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  /* Sync to Sites. */
  await syncCustomerToSites(event)
})

/**
 * 取引先ドキュメントの内容を現場ドキュメントに同期させます。
 * 同期対象のデータに変更がない場合、処理は中断されます。
 * @param {object} event onDocumentUpdatedトリガーのeventオブジェクトです。
 * @returns
 */
async function syncCustomerToSites(event) {
  /* Define sync fields. */
  const fields = ['name1', 'name2', 'abbr', 'abbrKana', 'deadline']
  /* Check the event object. */
  const before = event?.data?.before?.data() || undefined
  const after = event?.data?.after?.data() || undefined
  if (!before || !after)
    throw new Error('onDocumentUpdatedのeventオブジェクトが必要です。')
  /* Return if there are no change. */
  const isChanged = fields.some((field) => {
    return JSON.stringify(before[field]) !== JSON.stringify(after[field])
  })
  if (!isChanged) return
  /* Create synchronize data. */
  const docId = event.data.after.id
  const newData = Object.fromEntries(
    fields.map((field) => [field, after[field]])
  )
  newData.docId = docId
  newData.ref = firestore.doc(`Customers/${docId}`)
  /* Sync */
  const colRef = firestore.collection('Sites')
  const query = colRef.where('customer.docId', '==', docId)
  const querySnapshot = await query.get()
  const promises = querySnapshot.docs.map((doc) =>
    doc.ref.update({ customer: newData })
  )
  await Promise.all(promises)
}
