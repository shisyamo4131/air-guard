/**
 * ### employees.js
 *
 * 概要:
 * FirestoreのEmployeesコレクションドキュメントの更新をトリガーとする処理を定義しています。
 *
 * 機能詳細:
 * - ドキュメントの作成・更新時、インデックス用データとしてRealtime Databaseに一部のデータを同期します。
 * - ドキュメントの削除時、依存するサブコレクションドキュメントを削除します。
 *
 * 依存するサブコレクション:
 * - EmployeeMedicalCheckups
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const { getDatabase } = require('firebase-admin/database')
const { log, error } = require('firebase-functions/logger')
const { removeDependentDocuments } = require('./utils')
const database = getDatabase()

const updateDatabase = async (docId, data) => {
  const newItem = {
    code: data.code,
    fullName: data.fullName,
    fullNameKana: data.fullNameKana,
    abbr: data.abbr,
  }
  try {
    await database.ref(`Employees/${docId}`).set(newItem)
    log(`Database updated for docId ${docId}`, newItem)
  } catch (err) {
    error(`Error updating database for docId ${docId}:`, err)
  }
}

const removeDatabaseEntry = async (docId) => {
  try {
    await database.ref(`Employees/${docId}`).remove()
    log(`Database entry removed for docId ${docId}`)
  } catch (err) {
    error(`Error removing database entry for docId ${docId}:`, err)
  }
}

exports.onCreate = onDocumentCreated('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  const data = event.data.data()
  log(`Employee document created with docId ${docId}`, data)
  await updateDatabase(docId, data)
})

exports.onUpdate = onDocumentUpdated('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  const before = event.data.before.data()
  const after = event.data.after.data()
  log(`Employee document updated with docId ${docId}`, { before, after })
  await updateDatabase(docId, after)
})

exports.onDelete = onDocumentDeleted('Employees/{docId}', async (event) => {
  const docId = event.params.docId
  log(`Employee document deleted with docId ${docId}`)
  await removeDatabaseEntry(docId)
  await removeDependentDocuments(`Employees/${docId}`, [
    'EmployeeMedicalCheckups',
  ])
})
