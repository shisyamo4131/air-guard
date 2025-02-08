/*****************************************************************************
 * カスタムクラス定義: 従業員 - Employee -
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { EMPLOYEE_CONTRACT_TYPE } from './constants/employee-contract-types'
import { EMPLOYEE_STATUS } from './constants/employee-status'
import { generateProps } from './propsDefinition/propsUtil'

/*****************************************************************************
 * クラスで使用する、警備員登録情報のクラス定義
 *****************************************************************************/
export class SecurityRegistration {
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    // 警備員登録日
    this.registrationDate = item.registrationDate ?? ''

    // 警備経験開始日
    this.securityStartDate = item.securityStartDate ?? ''

    // ブランク
    this.blankMonths = item.blankMonths ?? 0

    // 本籍地
    this.honseki = item.honseki ?? ''

    // 緊急連絡先氏名
    this.emergencyContactName = item.emergencyContactName ?? ''

    // 緊急連絡先続柄
    this.emergencyContactRelation = item.emergencyContactRelation ?? ''

    // 緊急連絡先続柄詳細
    this.emergencyContactRelationDetail =
      item.emergencyContactRelationDetail ?? ''

    // 緊急連絡先住所
    this.emergencyContactAddress = item.emergencyContactAddress ?? ''

    // 緊急連絡先電話番号
    this.emergencyContactTel = item.emergencyContactTel ?? ''
  }

  toObject() {
    return { ...this }
  }

  // 警備経験年月を返します。
  get experiencePeriod() {
    if (!this.securityStartDate) {
      return { years: 0, months: 0 }
    }

    const startDate = new Date(this.securityStartDate)
    const currentDate = new Date()

    let totalMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12
    totalMonths += currentDate.getMonth() - startDate.getMonth()
    totalMonths -= this.blankMonths

    if (totalMonths < 0) {
      return { years: 0, months: 0 }
    }

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    return { years, months }
  }
}

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 従業員code
  code: { type: String, default: '', required: false },

  // 氏
  lastName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 名
  firstName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏名
  fullName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏カナ
  lastNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 名カナ
  firstNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏名カナ
  fullNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 性別
  gender: {
    type: String,
    default: 'male',
    required: false,
    validator: (v) => ['male', 'female'].includes(v),
    requiredByClass: true,
  },

  // 生年月日（YYYY-MM-DD）
  birth: { type: String, default: '', required: false, requiredByClass: true },

  // 郵便番号
  zipcode: { type: String, default: '', required: false },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 郵送先別住所フラグ
  hasSendAddress: { type: Boolean, default: false, required: false },

  // 郵送先郵便番号
  sendZipcode: { type: String, default: '', required: false },

  // 郵送先住所
  sendAddress1: { type: String, default: '', required: false },

  // 郵送先建物名・階数
  sendAddress2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // 携帯番号
  mobile: { type: String, default: '', required: false },

  // 入社年月日（YYYY-MM-DD）
  hireDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 退職年月日（YYYY-MM-DD）
  leaveDate: { type: String, default: '', required: false },

  // 退職事由
  leaveReason: { type: String, default: '', required: false },

  // 外国籍フラグ
  isForeigner: { type: Boolean, default: false, required: false },

  // 国籍
  nationality: { type: String, default: '', required: false },

  // 血液型
  bloodType: {
    type: String,
    default: '-',
    validator: (v) => ['A', 'B', 'O', 'AB', '-'].includes(v),
    required: false,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(EMPLOYEE_STATUS).includes(v),
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },

  // 画像ファイル参照先
  imgRef: { type: String, default: '', required: false },

  // 同期状態
  sync: { type: Boolean, default: false, required: false },

  /**
   * 雇用形態
   * - 配置管理においてアルバイトである従業員のシフト管理を実現するために用意。
   * - 従業員がアルバイトかどうかを判断するために使う。
   * - その他の用途では使用していないし、使用してはいけない。
   */
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) => Object.keys(EMPLOYEE_CONTRACT_TYPE).includes(v),
  },

  /**
   * 役職・役割（略称の語尾に付与される）
   * - 配置指示テキスト生成時に必要になる呼称を設定するため
   *   便宜上用意したプロパティ。
   */
  designation: { type: String, default: '', required: false },

  /**
   * 警備員登録情報
   */
  securityRegistration: {
    type: Object,
    default: () => new SecurityRegistration(),
    required: false,
  },

  /**
   * 警備員登録の有無
   */
  hasSecurityRegistration: { type: Boolean, default: false, required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * ACCESSORS
 *****************************************************************************/
const accessor = {
  fullName: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.lastName || !this.firstName) return ''
      return `${this.lastName} ${this.firstName}`
    },
    set(v) {},
  },
  fullNameKana: {
    configurable: true,
    enumerable: true,
    get() {
      if (!this.lastNameKana || !this.firstNameKana) return ''
      return `${this.lastNameKana} ${this.firstNameKana}`
    },
    set(v) {},
  },
  hasSecurityRegistration: {
    configurable: true,
    enumerable: true,
    get() {
      return !!this.securityRegistration.registrationDate
    },
    set(v) {},
  },
}

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Employee extends FireModel {
  // FireModel 設定
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

  // カスタムクラスマップ
  static customClassMap = {
    securityRegistration: SecurityRegistration,
  }

  // constructor をオーバーライド -> accessor を利用
  constructor(item = {}) {
    super(item)
    Object.defineProperties(this, {
      fullName: accessor.fullName,
      fullNameKana: accessor.fullNameKana,
      hasSecurityRegistration: accessor.hasSecurityRegistration,
    })
  }

  /**
   * クラスプロパティの状態に応じて、他のプロパティの値を初期化します。
   * - `isForeigner`がfalseの場合、`nationality`を初期化します。
   * - `leaveDate`が空の場合、`leaveReason`を初期化します。
   * - `hasSendAddress`がfalseの場合、`sendZipcode`、`sendAddress1`、`sendAddress2`に
   *   `zipcode`、`address1`、`address2`をセットします。
   */
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

  /**
   * 作成直前の処理です。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   */
  async beforeCreate() {
    this.#initializeDependentProperties()
    await super.beforeCreate()
  }

  /**
   * 更新直前の処理です。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   */
  async beforeUpdate() {
    this.#initializeDependentProperties()
    await super.beforeUpdate()
  }

  /**
   * 指定されたドキュメントIDのimgRefを更新します。
   * - ドキュメントIDとURLを受け取り、該当ドキュメントのimgRefを更新します。
   *
   * @param {string} docId - 更新対象の従業員ドキュメントのID
   * @param {string} url - 更新するimgRefのURL
   * @throws {Error} ドキュメントIDまたはURLが無効な場合、あるいはドキュメントが存在しない場合にエラーをスロー
   */
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

  /**
   * 指定された従業員codeに該当する従業員ドキュメントデータを配列で返します。
   * @param {string} code - 従業員コード
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   */
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

  /**
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
   */
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

  /**
   * Firestore の 'Employees' コレクションから指定された期間内に在職していた従業員ドキュメントを返します。
   *
   * @param {Object} options - オプションのフィルタ条件を含むオブジェクト。
   * @param {string | null} options.from - 期間開始日です。
   * @param {string | null} options.to - 期間終了日です。
   * @returns {Promise<Array<Object>>} Firestore のデータを持つ従業員インスタンスの配列を返します。
   * @throws {Error} Firestore のクエリが失敗した場合、詳細を含むエラーがスローされます。
   */
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

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class EmployeeMinimal extends Employee {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
    delete this.remarks
    delete this.createAt
    delete this.updateAt
    delete this.uid
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }

  static updateImgRef() {
    return Promise.reject(
      new Error('このクラスの updateImgRef は使用できません。')
    )
  }
}
