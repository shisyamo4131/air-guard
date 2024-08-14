/**
 * # transportation-const-applications.js
 *
 * 交通費申請データ`TransportationCostApplications`に関わるモジュール群。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-14 - 初版作成
 */
const { getDatabase } = require('firebase-admin/database')
const { error } = require('firebase-functions/logger')
const {
  onValueCreated,
  onValueDeleted,
  onValueWritten,
} = require('firebase-functions/v2/database')
const database = getDatabase()

/**
 * 交通費申請データの`status`に合わせて`statusDateKey`を更新します。
 * `status`が変更されたことを意味するため、タイムスタンプを登録します。
 * @param {Object} eventData トリガーのevent.data
 */
async function syncStatusDateKey(eventData) {
  const snapshot = await eventData.ref.parent.get()
  const data = snapshot.val()
  const path = `TransportationCostApplications/${snapshot.key}`
  const updates = {
    [`${path}/statusDateKey`]: `${data.status}-${data.date}`,
    [`${path}/${data.status.split(':')[1]}At`]: { '.sv': 'timestamp' },
  }
  await database.ref().update(updates)
}

/**
 * 稼働実績ごとの交通費`cost`が更新された時に実行される処理です。
 * 当該uidの交通費申請データについて`cost`の合計を`total`として更新します。
 */
exports.onCostWritten = onValueWritten(
  {
    ref: '/TransportationCostApplications/{uid}/OperationResults/{operationResultId}/cost',
    region: 'us-central1',
  },
  async (event) => {
    const operationrResultsRef = event.data.after.ref.parent.ref.parent
    const operationResultsSnapshot = await operationrResultsRef.get()
    if (!operationResultsSnapshot.exists()) return null
    const total = Object.keys(operationResultsSnapshot.val()).reduce(
      (sum, key) => {
        sum += operationResultsSnapshot.val()[key].cost
        return sum
      },
      0
    )
    await operationrResultsRef.ref.parent.update({ total })
  }
)
/******************************************************************************
 *
 * `status`が作成・更新された時の処理です。
 *
 * 監視パス: '/TransportationCostApplications/{uid}/status'
 *
 ******************************************************************************/
/**
 * 書き込みトリガー
 * - `statusDateKey`を更新します。
 */
exports.onStatusWritten = onValueWritten(
  {
    ref: '/TransportationCostApplications/{uid}/status',
    region: 'us-central1',
  },
  async (event) => {
    try {
      if (event.data.before.exists() && !event.data.after.exists()) return null
      await syncStatusDateKey(event.data.after)
    } catch (err) {
      error('Error updating transportation cost application:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)

/******************************************************************************
 *
 * `OperationReuslts`ドキュメントを同期元するデータが作成・更新・削除された時の処理です。
 *
 * 監視パス: '/TransportationCostApplications/original/{employeeId}/{date}/OperationResults'
 *
 ******************************************************************************/
/**
 * 作成トリガー
 *
 * - このトリガーは特定の従業員の、特定の日における稼働実績が初めて作成された時に実行されます。
 * - 初回の交通費申請データとして`total`、`status`、`createAt`を初期化します。
 */
exports.onOperationResultsCreated = onValueCreated(
  {
    ref: '/TransportationCostApplications/{uid}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    // 交通費申請データの初期化
    const updates = {}
    updates.status = '0:creating'
    await event.data.ref.parent.update(updates)
  }
)

/**
 * 削除トリガー
 * - 当該日のOperationResultsが全て削除された場合、uid直下に残ってしまうデータを削除します。
 */
exports.onOperationResultsDeleted = onValueDeleted(
  {
    ref: '/TransportationCostApplications/{uid}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    await event.data.ref.parent.remove()
  }
)
