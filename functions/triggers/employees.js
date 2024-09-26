/**
 * ## employees.js
 *
 * FirestoreのEmployeesドキュメントが作成・更新・削除トリガーに関する処理です。
 */
import {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
import { getDatabase } from 'firebase-admin/database'
import { getStorage } from 'firebase-admin/storage'
import { error, info } from 'firebase-functions/logger'
import {
  removeDependentDocuments,
  syncDependentDocuments,
  isDocumentChanged,
} from '../modules/utils.js'
import Employee from '../models/Employee.js'
const database = getDatabase()
const storage = getStorage()

/****************************************************************************
 * FirestoreのEmployeesドキュメントが作成されたときにトリガーされる関数。
 * - 作成されたドキュメントのデータを元に、Realtime Databaseにインデックスを作成します。
 *
 * @param {object} event - Firestoreのトリガーイベント。作成されたドキュメントのデータを含む。
 ****************************************************************************/
export const onCreate = onDocumentCreated(
  'Employees/{docId}',
  async (event) => {
    const docId = event.params.docId
    const data = event.data.data()

    // FirestoreのEmployeesドキュメントが作成されたことをログに出力
    info(`Employee document created. docId: ${docId}`)

    try {
      // Realtime Databaseにインデックスを作成
      await Employee.syncIndex(docId, data)
    } catch (err) {
      // エラーログを出力し、エラーを処理
      error(
        `Error occurred in Employee document creation trigger. docId: ${docId}`,
        err
      )
    }
  }
)

/****************************************************************************
 * FirestoreのEmployeesドキュメントが更新されたときにトリガーされる関数。
 * - 更新されたドキュメントのデータを元に、Realtime Databaseのインデックスや他の関連ドキュメントを更新します。
 * - ドキュメントが実際に変更された場合のみ、インデックスや関連ドキュメントの同期を行います。
 *
 * @param {object} event - Firestoreのトリガーイベント。更新後のドキュメントデータを含む。
 ****************************************************************************/
export const onUpdate = onDocumentUpdated(
  'Employees/{docId}',
  async (event) => {
    const docId = event.params.docId
    const after = event.data.after.data()

    // ドキュメントが実際に変更されたかを確認
    if (!isDocumentChanged(event)) return

    // FirestoreのEmployeesドキュメントが更新されたことをログに出力
    info(`Employee document updated. docId: ${docId}`)

    try {
      // Realtime Databaseにインデックスを同期
      await Employee.syncIndex(docId, after)

      // 他の関連ドキュメントを同期
      await syncDependentDocuments(
        'EmployeeContracts',
        'employeeId',
        'employee',
        after
      )
      await syncDependentDocuments(
        'EmployeeMedicalCheckups',
        'employeeId',
        'employee',
        after
      )
    } catch (err) {
      // エラーログを出力し、エラーを処理
      error(
        `Error occurred in Employee document update trigger. docId: ${docId}`,
        err
      )
    }
  }
)

/****************************************************************************
 * FirestoreのEmployeesドキュメントが削除されたときにトリガーされる関数。
 * - 削除されたドキュメントのデータを元に、AirGuardとの同期解除、関連インデックスおよび依存ドキュメントの削除を行います。
 * - 関連するファイルも削除します。
 *
 * @param {object} event - Firestoreのトリガーイベント。削除されたドキュメントデータを含む。
 ****************************************************************************/
export const onDelete = onDocumentDeleted(
  'Employees/{docId}',
  async (event) => {
    const docId = event.params.docId

    // FirestoreのEmployeesドキュメントが削除されたことをログに出力
    info(`Employee document deleted. docId: ${docId}`)

    try {
      // AirGuardとの同期設定を解除
      const data = event.data.data()
      if (data.sync) {
        const code = data.code
        await database.ref(`AirGuard/Employees/${code}`).update({ docId: null })
        info(`AirGuard sync settings removed for employee code: ${code}`)
      }

      // Realtime Databaseインデックスを削除
      await Employee.deleteIndex(docId)

      // 依存ドキュメントを削除
      await removeDependentDocuments(
        ['EmployeeContracts', 'EmployeeMedicalCheckups'],
        'employeeId',
        docId
      )

      // 画像ファイルの削除
      const directory = `images/employees/${docId}`
      const fileBucket = storage.bucket()
      await fileBucket.deleteFiles({ prefix: directory })
      info(`Related files deleted from directory: ${directory}`)
    } catch (err) {
      // エラーログを出力し、エラーを処理
      error(
        `Error occurred in Employee document delete trigger. docId: ${docId}`,
        err
      )
    }
  }
)
