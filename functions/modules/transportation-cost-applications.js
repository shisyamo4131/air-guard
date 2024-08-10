/**
 * # transportation-const-applications.js
 *
 */
const {
  onValueCreated,
  onValueUpdated,
  onValueDeleted,
} = require('firebase-functions/v2/database')

/**
 * 作成トリガー
 *
 * 以下のパス以下のデータが作成された時の処理です。。
 * '/TransportationCostApplications/{employeeId}/{date}/OperationResults'
 *
 * - 最初の交通費申請データとして`total`、`status`、`createAt`を用意します。
 */
exports.onOperationResultsCreated = onValueCreated(
  {
    ref: '/TransportationCostApplications/{employeeId}/{date}/OperationResults',
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
    updates.status = 'creating'
    updates.createAt = createAt
    await event.data.ref.parent.update(updates)
  }
)

/**
 * 更新トリガー
 *
 * 以下のパス以下のデータが更新された時の処理です。。
 * '/TransportationCostApplications/{employeeId}/{date}/OperationResults'
 *
 * - このトリガーが起動するパターンは2つあります。
 *  - 稼働実績ドキュメントが更新・削除された場合。
 *    - 但し、削除された結果、当該日のOperationResultsが0件になった場合は削除トリガーで処理されます。
 *  - 稼働実績データ部の`cost`が更新された場合。
 * - 監視パス以下のデータの`cost`の合計値を`total`に反映させます。
 * - `createAt`を更新します。
 * - `status`は変更しません。`status`の状態に応じた制御はApp側で行ってください。
 */
exports.onOperationResultsUpdated = onValueUpdated(
  {
    ref: '/TransportationCostApplications/{employeeId}/{date}/OperationResults',
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
 *
 * 以下のパス以下のデータが削除された時の処理です。。
 * '/TransportationCostApplications/{employeeId}/{date}/OperationResults'
 *
 * - 稼働実績が削除され、当該日のOperationResultsドキュメントが0件になった場合に実行されます。
 * - `/TransportationCostApplications/{employeeId}/{date}`を削除します。
 */
exports.onOperationResultsDeleted = onValueDeleted(
  {
    ref: '/TransportationCostApplications/{employeeId}/{date}/OperationResults',
    region: 'us-central1',
  },
  async (event) => {
    await event.data.ref.parent.remove()
  }
)
