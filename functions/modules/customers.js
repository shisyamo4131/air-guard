const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { info } = require('firebase-functions/logger')
const { isDocumentChanged, syncDocuments } = require('./utils')

/**
 * Firestoreドキュメントの更新トリガー。
 * Customerドキュメントが更新された際に、内容に変更がある場合は
 * 関連するSitesコレクションのドキュメントを同期します。
 *
 * @param {object} event - onDocumentUpdatedトリガーのイベントオブジェクト
 */
exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  // ドキュメント内容に変更があった場合のみ同期を行います。
  if (isDocumentChanged(event)) {
    info('Customerドキュメントが更新されました。')
    await syncDocuments('Sites', 'customer', event.data.after.data())
  }
})
