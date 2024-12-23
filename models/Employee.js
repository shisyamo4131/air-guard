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
      collection: 'MedicalCheckups',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'HealthInsurances',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'Pensions',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'EmploymentInsurances',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'OperationResults',
      field: 'employeeIds',
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

  /****************************************************************************
   * Firestore の 'Employees' コレクションから指定された期間内に在職していた従業員ドキュメントを返します。
   *
   * @param {Object} options - オプションのフィルタ条件を含むオブジェクト。
   * @param {string | null} options.from - 期間開始日です。
   * @param {string | null} options.to - 期間終了日です。
   * @returns {Promise<Array<Object>>} Firestore のデータを持つ従業員インスタンスの配列を返します。
   * @throws {Error} Firestore のクエリが失敗した場合、詳細を含むエラーがスローされます。
   ****************************************************************************/
  static async getExistingEmployees({ from, to }) {
    // 引数のチェック
    if (!from || !to) {
      const message = `[getExistingEmployees] 必要な引数が指定されていません。`
      // eslint-disable-next-line no-console
      console.error(message, { from, to })
      throw new Error(`${message}`)
    }

    const instance = new this()

    try {
      /**
       * 期間中に在籍していた従業員ドキュメントを取得
       * - 条件1) 処理時点で hireDate が to 以前、かつ leaveDate が設定されていない -> 現在在職中で、期間終了日以前に雇い入れられた従業員
       * - 条件2) 処理時点で hireDate が to 以前、かつ leaveDate が from 以降 -> 現在退職済みだが、退職日が期間開始日以降
       * 上記それぞれの条件で取得した ドキュメント を結合すると期間中に在籍していた従業員リストになる。
       */
      const [activeEmployees, leaveEmployees] = await Promise.all([
        // 条件1)
        instance.fetchDocs([
          ['where', 'hireDate', '<=', to],
          ['where', 'leaveDate', '==', ''],
        ]),
        // 条件2)
        instance.fetchDocs([
          ['where', 'hireDate', '<=', to],
          ['where', 'leaveDate', '>=', from],
        ]),
      ])

      // 結合して返す
      return activeEmployees.concat(leaveEmployees)
    } catch (error) {
      const message = `[getExistingEmployees] 不明なエラーが発生しました。`
      // eslint-disable-next-line no-console
      console.error(message, { from, to, error })
      throw error
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
