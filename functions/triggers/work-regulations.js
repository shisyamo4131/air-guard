/**
 * ## work-regulations.js
 *
 * WorkRegulationsドキュメントの作成・更新・削除トリガーに関する処理です。
 *
 * ### 機能概要
 * - ドキュメント更新時、従属ドキュメントとの同期処理を行います。
 */
const { onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { info, error } = require('firebase-functions/logger')
const {
  isDocumentChanged,
  syncDependentDocuments,
} = require('../modules/utils')

/**
 * WorkRegulationsドキュメントの更新トリガーです。
 * - ドキュメントの内容に変更があった場合に、従属するドキュメントのworkRegulationプロパティを同期します。
 *
 * #### 注意事項
 * - ドキュメントの内容に変更があったかどうかは`isDocumentChanged()`を利用します。
 * - ドキュメントの同期には`syncDependentDocuments()`を利用します。
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-16 - 初版作成
 */
exports.onUpdate = onDocumentUpdated(
  'WorkRegulations/{docId}',
  async (event) => {
    const docId = event.params.docId

    // ドキュメントに変更がない場合は処理を終了
    if (!isDocumentChanged(event)) return

    info(`WorkRegulationsドキュメントが更新されました。docId: ${docId}`)

    try {
      // 従属するドキュメントのworkRegulationプロパティを同期
      await syncDependentDocuments(
        'EmployeeContracts',
        'workRegulation.docId',
        'workRegulation',
        event.data.after.data()
      )
    } catch (err) {
      // エラーハンドリング：エラーログを出力し、処理を中断
      error(
        `WorkRegulationsドキュメントの同期に失敗しました。docId: ${docId}`,
        err
      )
    }
  }
)
