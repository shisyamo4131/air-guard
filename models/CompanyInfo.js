import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/CompanyInfo'

/**
 * CompanyInfo ドキュメントデータモデル
 * @author shisyamo4131
 */
export default class CompanyInfo extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'CompanyInfo'
  static classProps = classProps

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.tokenMap
  }

  /****************************************************************************
   * CompanyInfo ドキュメントを作成します。
   * - 唯一のドキュメントであり、ドキュメントIDは `companyInfo` に固定されます。
   *
   * @returns {Promise<DocumenntReference>} - 作成された CompanyInfo ドキュメントへの参照
   ****************************************************************************/
  async create() {
    try {
      return await super.create({ docId: 'companyInfo' })
    } catch (err) {
      const message = `[create] CompanyInfo ドキュメントの作成に失敗しました。`
      // eslint-disable-next-line no-console
      console.error(message, err)
      throw err
    }
  }

  /****************************************************************************
   * CompanyInfo ドキュメントを自身のインスタンスに読み込みます。
   * @returns {Promise<boolean>} - 読み込みに成功すると true を、失敗すると false を返します。
   ****************************************************************************/
  async fetch() {
    try {
      return await super.fetch(`companyInfo`)
    } catch (err) {
      const message = `[fetch] CompanyInfo ドキュメントの読み込みに失敗しました。`
      // eslint-disable-next-line no-console
      console.error(message, err)
      throw err
    }
  }
}
