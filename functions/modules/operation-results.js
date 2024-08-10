/**
 * # operation-results.js
 * Firestoreの稼働実績ドキュメントに関するモジュール
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-10 - 初版作成
 */
const { getDatabase } = require('firebase-admin/database')
const {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore')
const database = getDatabase()
// const SiteDaylySales = require('../models/SiteDaylySales')
// const { isDocumentChanged } = require('./utils')

/**
 * 稼働実績の内容を交通費申請データと同期します。
 * @param {Object} data トリガーのeventオブジェクトが保有するdataオブジェクト
 */
async function syncTransportationCostApplication(data) {
  const workers = data.workers
  const root = `TransportationCostApplications`
  const updates = {}
  workers.forEach((worker) => {
    const path = `${root}/${worker.employeeId}/${data.date}`
    const detailPath = `${path}/OperationResults/${data.docId}`
    updates[`${detailPath}/siteId`] = data.siteId
    updates[`${detailPath}/siteAbbr`] = data.site.abbr
    updates[`${detailPath}/startTime`] = worker.startTime
    updates[`${detailPath}/endTime`] = worker.endTime
    updates[`${detailPath}/breakMinutes`] = worker.breakMinutes
    updates[`${detailPath}/overtimeMinutes`] = worker.overtimeMinutes
    updates[`${detailPath}/createAt`] = { '.sv': 'timestamp' }
  })
  await database.ref().update(updates)
}

/**
 * 交通費申請データを削除します。
 * @param {Object} data トリガーのeventオブジェクトが保有するdataオブジェクト
 */
async function removeTransportationCostApplication(data) {
  const workers = data.workers
  const root = `TransportationCostApplications`
  const updates = {}
  workers.forEach((worker) => {
    const path = `${root}/${worker.employeeId}/${data.date}/OperationResults/${data.docId}`
    updates[`${path}`] = null
  })
  await database.ref().update(updates)
}

/**
 * ドキュメントの作成トリガー
 */
exports.onCreate = onDocumentCreated(
  'Sites/{siteId}/OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()

    // 交通費申請データと同期
    await syncTransportationCostApplication(data)

    // /* Sync SiteDaylySales */
    // await SiteDaylySales.sync(data.site.docId, data.date)
  }
)

/**
 * ドキュメントの更新トリガー
 */
exports.onUpdate = onDocumentUpdated(
  'Sites/{siteId}/OperationResults/{docId}',
  async (event) => {
    // const before = event.data.before.data()
    const after = event.data.after.data()

    // 交通費申請データと同期
    await syncTransportationCostApplication(after)

    // if (isDocumentChanged(event, ['site.docId', 'date', 'sales', 'workers'])) {
    //   /* Sync SiteDaylySales */
    //   await SiteDaylySales.sync(after.site.docId, after.date)
    // }
    // if (isDocumentChanged(event, ['site.docId', 'date'])) {
    //   /* Sync SiteDaylySales */
    //   await SiteDaylySales.sync(before.site.docId, before.date)
    // }
  }
)

/**
 * ドキュメントの削除トリガー
 */
exports.onDelete = onDocumentDeleted(
  'Sites/{siteId}/OperationResults/{docId}',
  async (event) => {
    const data = event.data.data()

    // 交通費申請データを削除
    await removeTransportationCostApplication(data)

    // /* Sync SiteDaylySales */
    // await SiteDaylySales.sync(data.site.docId, data.date)
  }
)
