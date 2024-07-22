/**
 * ### customer.js
 *
 * Customerドキュメントの作成・更新・削除トリガーに関する処理です。
 *
 * #### 機能概要
 * 1. ドキュメント更新時、従属ドキュメントとの同期処理を行います。
 * 2. ドキュメント削除時、AirGuardとの同期設定を解除します。
 *
 * #### 注意事項
 * 1. ドキュメント削除時、従属するSiteドキュメントを削除「しません」。
 *    -> アプリの仕様上、従属するSiteドキュメントが存在している場合、Customerドキュメントは削除できない。
 *    -> 万が一Customerドキュメントが消えてしまった場合、Siteドキュメントのcustomerプロパティが復元ができる「かもしれない」。
 */
const {
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { info, error } = require('firebase-functions/logger')
const { getDatabase } = require('firebase-admin/database')
const { isDocumentChanged, syncDocuments } = require('./utils')
const database = getDatabase()

/**
 * Customerドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するSiteドキュメントのcustomerプロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()を利用します。
 * - ドキュメントの同期にはsyncDocuments()を利用します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-22 - syncDocuments()およびSiteドキュメントの仕様変更に伴う修正。
 * - version 1.0.0 - 2024-07-10 - 初版作成
 */
exports.onUpdate = onDocumentUpdated('Customers/{docId}', async (event) => {
  if (!isDocumentChanged(event)) return
  info('Customerドキュメントが更新されました。')
  await syncDocuments(
    'Sites',
    'customerId',
    'customer',
    event.data.after.data()
  )
})

/**
 * Customerドキュメントの削除トリガーです。
 * - AirGuardとの同期設定を解除します。
 *
 * #### 更新履歴
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
exports.onDelete = onDocumentDeleted('Customers/{docId}', async (event) => {
  info(`Customerドキュメントが削除されました。`)
  try {
    // 同期設定済みの取引先ドキュメントであれば同期を解除する
    if (event.data.data().sync) {
      info(`AirGuardとの同期設定を解除します。`)
      const code = event.data.data().code
      await database.ref(`AirGuard/Customers/${code}`).update({ docId: null })
      info(`AirGuardとの同期設定を解除しました。。`)
    }
  } catch (err) {
    error(`Siteドキュメントの同期設定解除処理でエラーが発生しました。`, err)
  }
})
