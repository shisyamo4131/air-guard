import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/Site'

/**
 * ## Outsourcersドキュメントデータモデル【論理削除】
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Outsourcer extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'Outsourcers', [], true, ['abbr', 'abbrKana'], classProps)
  }

  /****************************************************************************
   * FireModelのcreateをオーバーライドします。
   * - コレクションを自動採番対象として、createのuseAutonumberをtrueに固定します。
   * @param {string} docId - 作成するドキュメントのID
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} ドキュメントの作成に失敗した場合
   ****************************************************************************/
  async create(docId = null) {
    try {
      await super.create({ docId, useAutonumber: true })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ドキュメントの作成に失敗しました:', error)
      throw new Error('ドキュメントの作成中にエラーが発生しました。')
    }
  }
}
