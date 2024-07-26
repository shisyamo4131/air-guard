/**
 * ## site-operation-schedule-bulks.js
 *
 * 現場の稼働予定（SiteOperationSchedule）ドキュメント一括作成用に用意されたモジュールです。
 * `SiteOperationScheduleBulks`コレクションのドキュメント作成トリガーについて処理を定義しています。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { error, info } = require('firebase-functions/logger')
const SiteOperationSchedule = require('../models/SiteOperationSchedule')
const firestore = getFirestore()
const BATCH_LIMIT = 300

/**
 * ドキュメント作成トリガー
 * - ドキュメントの`date`プロパティを参照し、格納されている日付分の`SiteOperationSchedule`ドキュメントを作成します。
 * - 既存ドキュメントは上書きします。
 * - 処理の最後に当該ドキュメントは削除します。
 */
exports.onCreate = onDocumentCreated(
  'SiteOperationScheduleBulks/{docId}',
  async (event) => {
    try {
      const data = event.data.data()
      const colRef = firestore.collection(
        `Sites/${data.siteId}/SiteOperationSchedules`
      )
      const batchArray = []
      data.dates.forEach((date, index) => {
        if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
        const schedule = new SiteOperationSchedule({ ...data, date })
        const docId = `${data.siteId}-${date}-${data.workShift}`
        const docRef = colRef.doc(docId)
        batchArray[batchArray.length - 1].set(docRef, { ...schedule })
      })
      await Promise.all(batchArray.map((batch) => batch.commit()))
      await event.data.ref.delete()
      info(
        `[site-operation-schedule-bulks.js] 現場稼働予定の一括作成処理が正常に完了しました。`
      )
    } catch (err) {
      error(
        `[site-operation-schedule-bulks.js] 現場稼働予定の一括作成処理でエラーが発生しました。`,
        err
      )
    }
  }
)
