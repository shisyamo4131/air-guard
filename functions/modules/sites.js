const {
  // onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
// const { getFirestore } = require('firebase-admin/firestore')
const { info, error } = require('firebase-functions/logger')
const { getDatabase } = require('firebase-admin/database')
const { removeDependentDocuments } = require('./utils')
// const firestore = getFirestore()
const database = getDatabase()

// const BATCH_LIMIT = 500

/**
 * Triggered when a new Site document is created.
 * If the Site is temporary, it creates bulk site schedules.
 */
// exports.onCreate = onDocumentCreated('Sites/{docId}', async (event) => {
//   const docId = event.params.docId
//   const data = event.data.data()
//   try {
//     if (data.temporary) {
//       log(`Creating bulk site schedules for temporary site: ${docId}`)
//       await bulkCreateSiteSchedules(docId, data)
//       log(`Bulk site schedules created successfully for site: ${docId}`)
//     }
//   } catch (err) {
//     error(`Error creating bulk site schedules for site: ${docId}`, err)
//   }
// })

/**
 * Siteドキュメントの削除トリガーです。
 * - AirGuardとの同期設定を解除します。
 *
 * #### 更新履歴
 * - version 1.1.0 - 2024-07-12 - SiteOperationSchedulesの削除処理を追加。
 *                              - SiteContractsの削除処理を追加。
 * - version 1.0.0 - 2024-07-11 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
exports.onDelete = onDocumentDeleted('Sites/{docId}', async (event) => {
  info(`Siteドキュメントが削除されました。`)
  const docId = event.params.docId
  try {
    // 同期設定済みの取引先ドキュメントであれば同期を解除する
    if (event.data.data().sync) {
      const code = event.data.data().code
      await database.ref(`AirGuard/Sites/${code}`).update({ docId: null })
      info(`AirGuardとの同期設定を解除しました。。`)
    }
  } catch (err) {
    error(`Siteドキュメントの同期設定解除処理でエラーが発生しました。`, err)
  }
  try {
    // 従属するドキュメントを削除
    await removeDependentDocuments(`Sites/${docId}`, [
      'SiteOperationSchedules',
      'SiteContracts',
    ])
    info('従属するドキュメントを削除しました。')
  } catch (err) {
    error(`Siteドキュメントの同期設定解除処理でエラーが発生しました。`, err)
  }
})

/**
 * Bulk create site operation schedules for specified dates.
 * @param {string} siteId - The ID of the site.
 * @param {object} data - The default schedule data to be used for each date.
 */
// async function bulkCreateSiteSchedules(siteId, data) {
//   const dates = data.defaultDates
//   const schedule = {
//     ...data.defaultSchedule,
//     siteId,
//     createAt: data.createAt,
//     createDate: data.createDate,
//     uid: data.uid,
//   }

//   const batchArray = []
//   const colRef = firestore.collection(`Sites/${siteId}/SiteOperationSchedules`)

//   try {
//     dates.forEach((date, index) => {
//       if (index % BATCH_LIMIT === 0) batchArray.push(firestore.batch())
//       const docRef = colRef.doc()
//       batchArray[batchArray.length - 1].set(docRef, {
//         ...structuredClone(schedule), // Node.js v17.0.0 以上が必要
//         // ...JSON.parse(JSON.stringify(schedule)), // Node.js v17.0.0 未満の場合
//         date,
//         docId: docRef.id,
//       })
//     })

//     await Promise.all(batchArray.map((batch) => batch.commit()))
//     log(`Bulk site schedules created for site: ${siteId}`)
//   } catch (err) {
//     error(`Error creating bulk site schedules for site: ${siteId}`, err)
//     throw err // Rethrow error to be caught by the caller
//   }
// }
