import { FireModel } from 'air-firebase'
import { accessor, classProps } from './propsDefinition/Employee'
import SecurityRegistration from './SecurityRegistration'

/**
 * 従業員データモデル
 * @author shisyamo4131
 */
export default class Employee extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Employees'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['lastNameKana', 'firstNameKana', 'abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'EmployeeMedicalCheckups',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'OperationResults',
      field: 'employeeId',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    securityRegistration: SecurityRegistration,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    Object.defineProperties(this, {
      fullName: accessor.fullName,
      fullNameKana: accessor.fullNameKana,
      hasSecurityRegistration: accessor.hasSecurityRegistration,
    })
  }

  /****************************************************************************
   * クラスプロパティの状態に応じて、他のプロパティの値を初期化します。
   * - `isForeigner`がfalseの場合、`nationality`を初期化します。
   * - `leaveDate`が空の場合、`leaveReason`を初期化します。
   * - `hasSendAddress`がfalseの場合、`sendZipcode`、`sendAddress1`、`sendAddress2`に
   *   `zipcode`、`address1`、`address2`をセットします。
   ****************************************************************************/
  #initializeDependentProperties() {
    if (!this.isForeigner) this.nationality = ''
    if (!this.leaveDate) this.leaveReason = ''
    // 送付先住所がなければ登録住所を送付先住所に複製
    if (!this.hasSendAddress) {
      this.sendZipcode = this.zipcode
      this.sendAddress1 = this.address1
      this.sendAddress2 = this.address2
    }
  }

  /****************************************************************************
   * FireModelのbeforeCreateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    this.#initializeDependentProperties()
    await super.beforeCreate()
  }

  /****************************************************************************
   * FireModelのbeforeUpdateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    this.#initializeDependentProperties()
    await super.beforeUpdate()
  }

  /****************************************************************************
   * 指定されたドキュメントIDのimgRefを更新します。
   * - ドキュメントIDとURLを受け取り、該当ドキュメントのimgRefを更新します。
   *
   * @param {string} docId - 更新対象の従業員ドキュメントのID
   * @param {string} url - 更新するimgRefのURL
   * @throws {Error} ドキュメントIDまたはURLが無効な場合、あるいはドキュメントが存在しない場合にエラーをスロー
   ****************************************************************************/
  static async updateImgRef(docId, url) {
    // クラス名を取得
    const className = this.name

    // docIdが無効でないかチェック
    if (!docId || typeof docId !== 'string') {
      throw new Error(
        `[${className} - updateImgRef]: A valid document ID must be provided.`
      )
    }

    // urlが無効でないかチェック
    if (!url || typeof url !== 'string') {
      throw new Error(
        `[${className} - updateImgRef]: A valid URL must be provided.`
      )
    }

    try {
      // インスタンスを生成し、ドキュメントを取得
      const instance = new this()

      // ドキュメントが存在するか確認
      const docExists = await instance.fetch(docId)
      if (!docExists) {
        throw new Error(
          `[${className} - updateImgRef]: Document not found in Employees collection. Document ID: ${docId}`
        )
      }

      // imgRefを更新
      instance.imgRef = url

      // ドキュメントを更新
      await instance.update()

      // eslint-disable-next-line no-console
      console.info(
        `[${className} - updateImgRef]: Successfully updated imgRef for document ID: ${docId}`
      )
    } catch (error) {
      // エラーメッセージの整形と出力
      const message = `[${className} - updateImgRef]: Failed to update imgRef for document ID: ${docId}. Error: ${error.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 指定された従業員codeに該当する従業員ドキュメントデータを配列で返します。
   * @param {string} code - 従業員コード
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('従業員コードは必須です。')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      const message = `[Employee.js fetchByCode] 従業員コード ${code} に対するドキュメントの取得に失敗しました: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 従業員codeの配列を受け取り、該当する従業員ドキュメントデータを配列で返します。
   * 従業員codeの配列は、重複があれば一意に整理されます。
   *
   * 2024-11-14 - 同期設定がなされたもののみを返すように変更
   * -> 稼働実績の取り込み時に、スポット登録された現場があると CODE 重複で意図しない
   *    マスタと紐づけられてしまう為。
   *
   * @param {Array<string>} codes - 従業員コードの配列
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map((arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      // return snapshots.flat()
      return snapshots.flat().filter((item) => item.sync)
    } catch (err) {
      const message = `[Employee.js fetchByCodes] ドキュメントの取得中にエラーが発生しました: ${err.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }
}

/**
 * Employee クラスから createAt, updateAt, uid, remarks, tokenMap を削除したクラスです。
 * - 非正規化した employee プロパティを持つドキュメントに保存するデータを提供するためのクラス
 * - 不要なプロパティを削除することでデータ量を抑制するために使用します。
 * - 更新系のメソッドは利用できません。
 */
export class EmployeeMinimal extends Employee {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.uid
    delete this.remarks
    delete this.tokenMap
  }

  /****************************************************************************
   * 更新系メソッドは使用不可
   ****************************************************************************/
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  static updateImgRef() {
    return Promise.reject(
      new Error('このクラスの updateImgRef は使用できません。')
    )
  }
}
