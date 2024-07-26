/**
 * ## site-operation-schedules.js
 *
 * `SiteOperationSchedules`コレクションのドキュメント更新トリガーについて処理を定義しています。
 *
 * ### 機能詳細
 * `SiteOperationSchedules`コレクションのドキュメントidは`siteId`、`date`、`workShift`の組み合わせです。
 * ドキュメントのkeyであるこれらの値に変更があった場合、ドキュメントのidと実際のデータの相関が崩れます。
 * `siteId`、`date`または`workShift`に変更があった場合、正規のドキュメントidでドキュメントを作り直し、
 * 当該ドキュメントを削除します。
 *
 * ### 注意事項
 * - `Sites`のサブコレクションであるため、本来は`siteId`の変更に対応する必要はありませんが、
 *   これに対応することで現場稼働予定ドキュメントを別の現場に従属させ直すことが可能になります。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */

const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { error, info } = require('firebase-functions/logger')
const firestore = getFirestore()

/**
 * ドキュメント更新トリガー
 * - `date`または`workShift`に変更があった場合、同一内容のドキュメントを正規のidで作成します。
 * - 作成元となった当該ドキュメントは削除します。
 */
exports.onUpdate = onDocumentUpdated(
  'Sites/{siteId}/SiteOperationSchedules/{docId}',
  async (event) => {
    try {
      const before = event.data.before.data()
      const after = event.data.after.data()
      const colRef = firestore.collection(
        `Sites/${after.siteId}/SiteOperationSchedules`
      )
      if (
        before.siteId !== after.siteId ||
        before.date !== after.date ||
        before.workShift !== after.workShift
      ) {
        info(
          `[site-operation-schedules.js] 現場稼働予定の現場id、予定日または勤務区分が変更されました。ドキュメントidとの整合性を保つため、ドキュメントを再作成します。`
        )
        const batch = firestore.batch()
        const docId = `${after.siteId}-${after.date}-${after.workShift}`
        const docRef = colRef.doc(docId)
        batch.set(docRef, after)
        batch.delete(event.data.after.ref)
        await batch.commit()
        info(
          `[site-operation-schedules.js] 現場稼働予定のドキュメント再作成処理が完了しました。`
        )
      }
    } catch (err) {
      error(
        `[site-operation-schedules.js] 現場稼働予定のドキュメント再作成処理でエラーが発生しました。`,
        err
      )
    }
  }
)
