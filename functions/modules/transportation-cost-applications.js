/**
 * # transportation-const-applications.js
 *
 * 交通費申請データ`TransportationCostApplications`に関わるモジュール群。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-08-11 - 交通費申請データの構造変更による修正。
 *                              - `status`の変更に応じてデータの複製と削除を行う処理を追加。
 * - version 1.0.0 - 2024-08-10 - 初版作成
 */
const { getDatabase } = require('firebase-admin/database')
const { error } = require('firebase-functions/logger')
const {
  onValueCreated,
  onValueUpdated,
  onValueDeleted,
} = require('firebase-functions/v2/database')
const database = getDatabase()

/******************************************************************************
 *
 * `status`が作成・更新された時の処理です。
 *
 * 監視パス: '/TransportationCostApplications/original/{employeeId}/{date}/status'
 *
 ******************************************************************************/
/**
 * 作成トリガー
 * - `original`以下のデータを`status`に応じたパスに複製します。
 */
exports.onStatusCreated = onValueCreated(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/status',
    region: 'us-central1',
  },
  async (event) => {
    try {
      const { employeeId, date } = event.params
      const status = event.data.val().split(':')[1]
      const path = `TransportationCostApplications/${status}/${employeeId}/${date}`
      const snapshot = await event.data.ref.parent.get()
      const data = snapshot.val()
      await database.ref(path).update(data)
    } catch (err) {
      error('Error updating transportation cost application:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)

/**
 * 更新トリガー
 * - `status`の変更前後で、対応するパスに複製データを移動します。
 */
exports.onStatusUpdated = onValueUpdated(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/status',
    region: 'us-central1',
  },
  async (event) => {
    try {
      const { employeeId, date } = event.params
      const before = event.data.before.val().split(':')[1]
      const after = event.data.after.val().split(':')[1]
      const data = (await event.data.after.ref.parent.get()).val()

      await database.ref().update({
        [`TransportationCostApplications/${before}/${employeeId}/${date}`]:
          null,
        [`TransportationCostApplications/${after}/${employeeId}/${date}`]: data,
      })
    } catch (err) {
      error('Error updating transportation cost application:', {
        error: err.message,
        stack: err.stack,
        params: event.params,
      })
    }
  }
)

/**
 * 削除トリガー
 * - `original`が削除された際に、対応する複製データを削除します。
 */
exports.onStatusDeleted = onValueDeleted(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/status',
    region: 'us-central1',
  },
  async (event) => {
    try {
      const { employeeId, date } = event.params
      const status = event.data.val().split(':')[1]
      await database
        .ref(`TransportationCostApplications/${status}/${employeeId}/${date}`)
        .remove()
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
 * - 初回の交通費申請データとして`total`、`status`、`createAt`を初期化します。
 */
exports.onOperationResultsCreated = onValueCreated(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    // 作成された稼働実績データのドキュメントidを取得
    const operationResultId = Object.keys(event.data.val())[0]

    // 作成された稼働実績データのデータ作成日時を取得
    const createAt = event.data.val()[operationResultId].createAt

    // 交通費申請データの初期化
    const updates = {}
    updates.total = 0
    updates.status = '0:creating'
    updates.createAt = createAt
    await event.data.ref.parent.update(updates)
  }
)

/**
 * 更新トリガー
 * - 稼働実績データの`cost`の合計値を`total`に反映させます。
 * - `status`は変更しません。`status`の状態に応じた制御はアプリ側で行います。
 */
exports.onOperationResultsUpdated = onValueUpdated(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    const data = event.data.after.val()
    const total = Object.keys(data).reduce((sum, docId) => {
      sum = sum + data[docId]?.cost || 0
      return sum
    }, 0)
    const updates = {}
    updates.total = total
    await event.data.after.ref.parent.update(updates)
  }
)

/**
 * 削除トリガー
 * - 当該日のOperationResultsが全て削除された場合、`original`のデータも削除します。
 * - `status`も削除されるため、複製データは`status`の削除トリガーで削除されます。
 */
exports.onOperationResultsDeleted = onValueDeleted(
  {
    ref: '/TransportationCostApplications/original/{employeeId}/{date}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    await event.data.ref.parent.remove()
  }
)
