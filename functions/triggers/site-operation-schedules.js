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
 * - `Sites`の従属ドキュメントであるため、本来は`siteId`の変更に対応する必要はありませんが、
 *   これに対応することで現場稼働予定ドキュメントを別の現場に従属させ直すことが可能になります。
 * - `siteId`、`date`、`workShift`の変更時にドキュメントを再作成しますが、アプリ側でこれらの変更は抑制すべきです。
 *
 * @author shisyamo4131
 */

import {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { error, info, warn } from 'firebase-functions/logger'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { isDocumentChanged } from '../modules/utils.js'
dayjs.extend(utc)
dayjs.extend(timezone)
const firestore = getFirestore()
const database = getDatabase()

/**
 * ドキュメント作成トリガー
 * - Realtime Databaseに更新履歴を書き込みます。
 */
export const onCreate = onDocumentCreated(
  `SiteOperationSchedules/{docId}`,
  async (event) => {
    const data = event.data.data()
    await pushHistory(data, 'create')
  }
)

/**
 * ドキュメント更新トリガー
 * - `siteId`、`date`または`workShift`に変更があった場合、同一内容のドキュメントを正規のidで再作成します。
 * - 作成元となった当該ドキュメントは削除します。
 * - 更新履歴をRealtime Databaseに書き込みます。再作成の場合は書き込みません。
 */
export const onUpdate = onDocumentUpdated(
  'SiteOperationSchedules/{docId}',
  async (event) => {
    // ドキュメントが更新されているかを確認 -> 更新されていなければ終了
    if (!isDocumentChanged(event)) return

    // 稼働予定の再作成（現場のドキュメントid、稼働日、勤務区分のどれかに変更があった場合のみ処理される）
    await recreateSchedule(event)

    // 更新履歴の書き込み
    const before = event.data.before.data()
    const after = event.data.after.data()
    if (
      before.siteId !== after.siteId ||
      before.date !== after.date ||
      before.workShift !== after.workShift
    ) {
      // recreateSchedule()が実行されているため、更新履歴の書き込みは不要
    } else {
      await pushHistory(after, 'update', {
        requiredWorkers: before.requiredWorkers,
        qualification: before.qualification,
        startTime: before.startTime,
        endTime: before.endTime,
      })
    }
  }
)

/**
 * ドキュメントの削除トリガー
 * - Realtime Databaseに更新履歴を書き込みます。
 */
export const onDelete = onDocumentDeleted(
  'SiteOperationSchedules/{docId}',
  async (event) => {
    const data = event.data.data()
    await pushHistory(data, 'delete')
  }
)

/**
 * 稼働予定ドキュメントのアーカイブドキュメントが削除された時の処理です。
 * - Realtime Databaseに保存されている対象ドキュメントのCUD履歴を削除します。
 */
export const onDeleteArchive = onDocumentDeleted(
  'SiteOperationSchedules_archive/{docId}',
  async (event) => {
    const { docId, siteId } = event.data.data()

    if (!docId || !siteId) {
      warn(
        '[onDeleteArchive] docId または siteId が存在しません。処理をスキップします。',
        { docId, siteId }
      )
      return
    }

    try {
      const dbRef = database.ref(`/History/SiteOperationSchedules/${siteId}`)
      const queryRef = dbRef.orderByChild('docId').equalTo(docId)

      // Realtime Database のクエリ実行
      const snapshot = await queryRef.get()

      if (!snapshot.exists()) {
        info(
          '[onDeleteArchive] 削除対象の履歴が存在しません。処理をスキップします。',
          { docId, siteId }
        )
        return
      }

      // 削除データの構築
      const deletes = Object.keys(snapshot.val()).reduce((result, key) => {
        result[`/History/SiteOperationSchedules/${siteId}/${key}`] = null
        return result
      }, {})

      // Realtime Database の更新
      await database.ref().update(deletes)

      info('[onDeleteArchive] 履歴の削除が正常に完了しました。', {
        docId,
        siteId,
        deletedCount: Object.keys(deletes).length,
      })
    } catch (err) {
      error('[onDeleteArchive] 履歴削除中にエラーが発生しました。', {
        message: err.message,
        stack: err.stack,
        docId,
        siteId,
      })
      throw err
    }
  }
)

/**
 * 現場稼働予定ドキュメントの更新履歴を`History/SiteOperationSchedules`に書き込みます。
 * - アプリ側で読み込むデータ量を抑制するため、書き込むデータを最低限にしています。
 * @param {Object} data Firestoreのトリガーオブジェクト
 * @param {string} type 'create' | 'update' | 'delete'
 * @param {Object} before 更新トリガーの`event.data.before.data()`です。
 */
async function pushHistory(data, type, before) {
  const siteId = data.siteId
  const timestamp = dayjs().tz('Asia/Tokyo').format('YYYYMMDDHHmmss')
  const item = {
    date: data.date,
    docId: data.docId,
    qualification: data.qualification,
    remarks: data.remarks,
    type,
    requiredWorkers: data.requiredWorkers,
    workShift: data.workShift,
    uid: data.uid,
    before: before && type === 'update' ? before : null,
    startTime: data.startTime,
    endTime: data.endTime,
  }
  const dbRef = database.ref(
    `History/SiteOperationSchedules/${siteId}/${timestamp}-${item.date}`
  )
  await dbRef.set(item)
}

/**
 * 現場の稼働予定を再作成します。
 * - 現場のドキュメントid、稼働日、勤務区分のどれかに変更があった場合にのみ処理されます。
 * @param {Object} event 更新トリガーから引き渡されるイベントオブジェクト
 */
async function recreateSchedule(event) {
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
