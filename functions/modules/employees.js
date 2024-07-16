/**
 * ### employees.js
 *
 * FirestoreのEmployeesドキュメントが作成・更新・削除トリガーに関する処理です。
 */
const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getDatabase } = require('firebase-admin/database')
const { getStorage } = require('firebase-admin/storage')
const { log, error, info } = require('firebase-functions/logger')
const { removeDependentDocuments } = require('./utils')
const database = getDatabase()
const storage = getStorage()

/**
 * Employeeドキュメントの作成トリガーです。
 * - Realtime DatabaseにEmployeesインデックスを作成します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-02 - 初版作成
 */
exports.onCreate = onDocumentCreated('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  const data = event.data.data()
  log(`Employeeドキュメントが作成されました。`)
  try {
    await updateIndex(docId, data)
  } catch (err) {
    error(
      `Employeeドキュメントの作成トリガー内処理でエラーが発生しました。`,
      err
    )
  }
})

/**
 * Employeeドキュメントの更新トリガーです。
 * - Realtime DatabaseのEmployeeインデックスを更新しますた。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-02 - 初版作成
 */
exports.onUpdate = onDocumentUpdated('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  const after = event.data.after.data()
  log(`Employeeドキュメントが更新されました。`)
  try {
    await updateIndex(docId, after)
  } catch (err) {
    error(
      `Employeeドキュメントの更新トリガー内処理でエラーが発生しました。`,
      err
    )
  }
})

/**
 * Employeeドキュメントの削除トリガーです。
 * - Realtime DatabaseのEmployeeインデックスを更新（削除）します。
 * - 依存コレクションのすべてのドキュメントを削除します。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-16 - AirGuardとの同期解除処理を追加
 *                              - Storage内のファイル削除処理を追加
 * - version 1.0.0 - 2024-07-02 - 初版作成
 */
exports.onDelete = onDocumentDeleted('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  log(`Employeeドキュメントが削除されました。`)

  /* AirGuardとの同期設定解除処理 */
  try {
    // 同期設定済みの取引先ドキュメントであれば同期を解除する
    if (event.data.data().sync) {
      const code = event.data.data().code
      await database.ref(`AirGuard/Employees/${code}`).update({ docId: null })
      info(`AirGuardとの同期設定を解除しました。`)
    }
    // インデックスを削除
    await removeIndex(docId)
    // 依存ドキュメントを削除
    await removeDependentDocuments(`Employees/${docId}`, [
      'EmployeeMedicalCheckups',
    ])
    // ファイル削除
    const directory = `images/employees/${docId}`
    const fileBucket = storage.bucket()
    await fileBucket.deleteFiles({ prefix: directory })
    info(`関連するファイルを削除しました。`)
  } catch (err) {
    error(
      `Employeeドキュメントの削除トリガー内処理でエラーが発生しました。`,
      err
    )
  }
})

/**
 * Realtime DatabaseのEmployeesインデックスを更新します。
 * @param {string} docId
 * @param {object} data
 */
const updateIndex = async (docId, data) => {
  const newItem = {
    code: data.code,
    fullName: data.fullName,
    fullNameKana: data.fullNameKana,
    abbr: data.abbr,
  }
  try {
    await database.ref(`Employees/${docId}`).set(newItem)
    log(`インデックスを更新しました。 docId: ${docId}`)
  } catch (err) {
    error(`インデックスの更新に失敗しました。 docId: ${docId}`)
    throw err
  }
}

/**
 * Realtime DatabaseのEmployeesインデックスを削除します。
 * @param {string} docId
 */
const removeIndex = async (docId) => {
  try {
    await database.ref(`Employees/${docId}`).remove()
    log(`インデックスを削除しました。 docId: ${docId}`)
  } catch (err) {
    error(`インデックスの削除に失敗しました。 docId: ${docId}`)
  }
}
