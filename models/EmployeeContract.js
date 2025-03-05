/*****************************************************************************
 * カスタムクラス定義: 従業員雇用契約 - EmployeeContract -
 *
 * @author shisyamo4131
 * @refact 2025-03-05
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { EmployeeMinimal } from './Employee'
import { WorkRegulationMinimal } from './WorkRegulation'
import EmployeeAllowance from './EmployeeAllowance'
import { EMPLOYEE_CONTRACT_TYPE } from './constants/employee-contract-types'
import { PAYMENT_TYPE } from './constants/payment-types'
import { generateProps } from './propsDefinition/propsUtil'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 従業員ID
  employeeId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 従業員
  employee: {
    type: Object,
    default: () => new EmployeeMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 契約開始日
  startDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 契約期間の定め
  hasPeriod: { type: Boolean, default: true, required: false },

  // 契約満了日
  expiredDate: { type: String, default: '', required: false },

  // 雇用形態
  contractType: {
    type: String,
    default: 'part-time',
    validator: (v) => Object.keys(EMPLOYEE_CONTRACT_TYPE).includes(v),
    required: true,
    requiredByClass: true,
  },

  // 就業規則ID
  workRegulationId: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 就業規則
  workRegulation: {
    type: Object,
    default: () => new WorkRegulationMinimal(),
    required: false,
    requiredByClass: true,
  },

  // 支給形態
  paymentType: {
    type: String,
    default: 'daily',
    validator: (v) => Object.keys(PAYMENT_TYPE).includes(v),
    requiredByClass: true,
  },

  // 基本給
  basicWage: {
    type: Number,
    default: null,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: true,
  },

  // 交通費支給
  providesTransportationAllowance: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 健康保険加入
  isHealthInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 厚生年金加入
  isPensionRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 雇用保険加入
  isEmploymentInsuranceRequired: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 手当 ID の配列
  allowanceIds: {
    type: Array,
    default: () => [],
    required: false,
  },

  // 手当
  allowances: {
    type: Array,
    default: () => [],
    required: false,
  },

  // 備考
  remarks: { type: String, default: '', required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

const accessor = {
  allowanceIds: {
    enumerable: true,
    configurable: true,
    get() {
      return this.allowances.map(({ docId }) => docId)
    },
    set(v) {},
  },
}

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class EmployeeContract extends FireModel {
  // FireModel 設定
  static collectionPath = 'EmployeeContracts'
  static logicalDelete = false
  static classProps = classProps
  static tokenFields = []
  static hasMany = []

  // カスタムクラスマップ
  static customClassMap = {
    employee: EmployeeMinimal,
    workRegulation: WorkRegulationMinimal,
    allowances: EmployeeAllowance,
  }

  // initialize をオーバーライドし、アクセサーを設定
  initialize(item = {}) {
    super.initialize(item)
    Object.defineProperties(this, {
      allowanceIds: accessor.allowanceIds, // workMinutes を自動計算にする。
    })
  }

  /**
   * beforeCreateをオーバーライドします。
   * - `employeeId`、`startDate`の入力チェックを行います。
   * - `employeeId`と`startDate`が同一である他のドキュメントが存在した場合はエラーをスローします。
   * - `employeeId`に該当する`employee`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   */
  async beforeCreate() {
    if (!this.employeeId) {
      throw new Error('従業員の指定が必要です。')
    }
    if (!this.startDate) {
      throw new Error('契約日の指定が必要です。')
    }
    if (this.expiredDate && this.expiredDate < this.startDate) {
      throw new Error('契約日が契約満了日の前後関係が正しくありません。')
    }
    const id = `${this.employeeId}-${this.startDate}`
    const existingContract = await this.fetchDoc(id)
    if (existingContract) {
      throw new Error('同一契約日の雇用契約が既に登録されています。')
    }
    try {
      // 従業員情報の取得とセット
      await this.#loadEmployee()

      // 就業規則情報の取得とセット
      await this.#loadWorkRegulation()

      // 契約期間の定めがなければ契約満了日に空文字列をセット
      if (!this.hasPeriod) this.expiredDate = ''

      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[EmployeeContract.js beforeCreate] An error has occured. ${err.message}`
      )
      throw err
    }
  }

  /**
   * beforeUpdateをオーバーライドします。
   * - 従業員ID、契約日が変更されていないかをチェックします。
   * - 就業規則IDが変更されていた場合、就業規則情報を読み込みます。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} - 従業員、契約日が変更されている場合にエラーをスローします。
   * @throws {Error} - 就業規則情報が取得できなかった場合にエラーをスローします。
   */
  async beforeUpdate() {
    try {
      // 従業員ID、契約日は変更不可
      const { employeeId, startDate } = this._beforeData
      if (this.employeeId !== employeeId || this.startDate !== startDate) {
        throw new Error('従業員、契約日は変更できません。')
      }

      // 就業規則が変更されていれば就業規則情報を取得してセット
      if (this.workRegulationId !== this._beforeData.workRegulationId) {
        await this.#loadWorkRegulation()
      }

      // 契約期間の定めがなければ契約満了日に空文字列をセット
      if (!this.hasPeriod) this.expiredDate = ''

      await super.beforeUpdate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[EmployeeContract.js beforeUpdate] An error has occured. ${err.message}`
      )
      throw err
    }
  }

  /**
   * 従業員情報を自身の workRegulation プロパティに読み込みます。
   * @returns {Promise<void>} - 処理が完了すると解決される Promise
   * @throws {Error} - 従業員IDが自身のプロパティにセットされていない場合にエラーをスローします。
   * @throws {Error} - 従業員情報が取得できなかった場合にエラーをスローします。
   */
  async #loadEmployee() {
    if (!this.employeeId) throw new Error('従業員IDが必要です。')
    const isDocExist = await this.employee.fetch(this.employeeId)
    if (!isDocExist) {
      throw new Error('従業員情報が取得できませんでした。')
    }
  }

  /**
   * 就業規則情報を自身の workRegulation プロパティに読み込みます。
   * @returns {Promise<void>} - 処理が完了すると解決される Promise
   * @throws {Error} - 就業規則IDが自身のプロパティにセットされていない場合にエラーをスローします。
   * @throws {Error} - 就業規則情報が取得できなかった場合にエラーをスローします。
   */
  async #loadWorkRegulation() {
    if (!this.workRegulationId) throw new Error('就業規則IDが必要です。')
    const isDocExist = await this.workRegulation.fetch(this.workRegulationId)
    if (!isDocExist) {
      throw new Error('就業規則情報が取得できませんでした。')
    }
  }

  /**
   * createをオーバーライドします。
   * - ドキュメントIDを`${employeeId}-${startDate}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   */
  async create() {
    const docId = `${this.employeeId}-${this.startDate}`
    return await super.create({ docId })
  }

  /**
   * 指定された複数の`employeeId`に該当するドキュメントを取得します。
   * - 30件ずつチャンクに分けてFirestoreにクエリを実行します。
   * - 各クエリ結果をまとめて返します。
   *
   * @param {Array<string>} ids - 取得対象のemployeeIdの配列
   * @returns {Promise<Array>} - 一致するドキュメントの配列を返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   */
  async fetchByEmployeeIds(ids) {
    // 引数が配列でない、または空の場合は空配列を返す
    if (!Array.isArray(ids) || ids.length === 0) return []

    try {
      // 重複を排除した`ids`を取得
      const unique = [...new Set(ids)]

      // `unique`配列を30件ずつのチャンクに分割
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )

      // 各チャンクに対してFirestoreクエリを実行し、ドキュメントを取得
      const promises = chunked.map(async (arr) => {
        const constraints = [['where', 'employeeId', 'in', arr]]
        return await this.fetchDocs(constraints)
      })

      // すべてのクエリ結果が解決されるまで待機
      const snapshots = await Promise.all(promises)

      // 各クエリ結果をフラットにまとめて返す
      return snapshots.flat()
    } catch (err) {
      // エラーハンドリング：エラーメッセージを出力し、エラーを再スロー
      // eslint-disable-next-line no-console
      console.error(
        `[fetchByEmployeeIds] Error fetching documents: ${err.message}`,
        { err }
      )

      // エラーを再スローして呼び出し元に通知
      throw err
    }
  }
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class EmployeeContractMinimal extends EmployeeContract {
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
}
