/**
 * 【使用不可】
 */
import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/OperationResultWorker'
/**
 * 稼働実績明細のデータモデルです。
 *
 * - `OperationResults`ドキュメントの`workers`配列に保存されるオブジェクトのデータモデルです。
 * - FireModelを継承していますが、ドキュメントとして保存されるデータではないため、ドキュメントに関するメソッドを削除しています。
 * - 同様に、利用する必要のないプロパティであるtokenMapも削除しています。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class OperationResultWorker extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'OperationResultWorkers', [], false, [], classProps)

    // FireModelが提供する不要なプロパティを削除
    delete this.docId
    delete this.tokenMap
    delete this.createAt
    delete this.updateAt
    delete this.uid

    // FireModelが提供する不要なメソッドを削除
    delete this.create
    delete this.fetch
    delete this.fetchDoc
    delete this.fetchDocs
    delete this.update
    delete this.delete
    delete this.deleteAll
    delete this.unsubscribe
    delete this.subscribe
    delete this.subscribeDocs
  }
}
