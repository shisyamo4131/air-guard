const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { isDocumentChanged, syncDocuments } = require('./utils')

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
  /* Return if there are no change. */
  if (!isDocumentChanged(event)) return
  /* Create synchronize data. */
  await syncDocuments('Sites', 'customer', event.data.after.data())
}
