import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResultWorker'
/**
 * ## OperationWorkResults ドキュメントデータモデル【物理削除】
 *
 * 稼働実績明細から作成される交通費申請のデータモデルです。
 *
 * - OperationResultsドキュメントと同期して生成されるドキュメントです。
 * - 同期はCloud Functionsで行われるため、createメソッドを保有しません。
 * - 同様に、OperationResultsドキュメントと同期されるため、update、deleteメソッドも保有しません。
 * - 但し、交通費申請に関わるデータの更新処理を行う為、独自のメソッドの中でsuper.update()をコールしています。
 * - 保有するプロパティはOperationResultWorkerを継承しつつ、交通費申請に必要なプロパティが追加されています。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class OperationWorkResult extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'OperationWorkResults', [], false, [], classProps)

    // FireModelが提供する不要なプロパティを削除
    delete this.tokenMap
  }

  /****************************************************************************
   * initializeをオーバーライドします。
   * - `OperationResultWorker`データモデルで定義されたプロパティ以外に、
   *   `operationResultId`を保有するようにします。
   * - `operationResultId`は、同期元となる`OperationResults`ドキュメントのIDです。
   ****************************************************************************/
  initialize(item = {}) {
    this.operationResultId = item?.operationResultId || ''
    this.transportationCost = item?.transportationCost || {
      type: 'on-cash',
      amount: 0,
      status: '0:creating',
      createAt: null,
      draftAt: null,
      pendingAt: null,
      approvedAt: null,
      settledAt: null,
      rejectedAt: null,
      rejectReason: '',
      updateAt: null,
    }
    super.initialize(item)
  }

  /****************************************************************************
   * 交通費の申請状態を`1:draft`（申請受付中）に更新します。
   ****************************************************************************/
  async toDraft() {
    this.transportationCost.status = '1:draft'
    this.transportationCost.draftAt = new Date()
    this.transportationCost.updateAt = new Date()
    await super.update()
  }

  /****************************************************************************
   * 交通費の申請状態を`2:pending`（申請中）に更新します。
   ****************************************************************************/
  async toPending() {
    this.transportationCost.status = '2:pending'
    this.transportationCost.pendingAt = new Date()
    this.transportationCost.updateAt = new Date()
    await super.update()
  }
}
