/*****************************************************************************
 * カスタムクラス定義: 従業員雇用契約 - EmployeeContract -
 *
 * @author shisyamo4131
 * @refact 2025-03-05
 *****************************************************************************/
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { EmployeeMinimal } from './Employee.js'
import { WorkRegulationMinimal } from './WorkRegulation.js'
import EmployeeAllowance from './EmployeeAllowance.js'
import { generateProps } from './propsDefinition/propsUtil.js'
const firestore = getFirestore()
const database = getDatabase()

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

const { classProps } = generateProps(propsDefinition)

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
      // workMinutes を自動計算にする。
      allowanceIds: accessor.allowanceIds,
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
   * 指定された従業員の期間内に適用する可能性がある雇用契約データを取得します。
   *
   * この関数は、指定された従業員IDに基づいて、`from` より前に開始された最新の雇用契約と、
   * `from` から `to` の期間内に開始されたすべての雇用契約を取得します。
   * - `from` より前の雇用契約は、最新の1件のみ取得されます。
   * - `from` 以降、`to` 以前の雇用契約は、すべて取得されます。
   * - Firestoreのトランザクションが提供されている場合、その中でクエリが実行されます。
   *
   * @param {Object} options - クエリオプションを含むオブジェクト。
   * @param {Object} options.transaction - Firestoreのトランザクションオブジェクト。
   * @param {string} options.employeeId - 対象従業員のID。
   * @param {string} options.from - 取得する期間の開始日（YYYY-MM-DD形式）。
   * @param {string} options.to - 取得する期間の終了日（YYYY-MM-DD形式）。
   * @returns {Promise<Array<Object>>} - 雇用契約データの配列を返します。
   * @throws {Error} - 必須パラメータが不足しているか、Firestoreクエリの実行中にエラーが発生した場合にスローされます。
   */
  static async getEmployeeContracts({
    employeeId = null,
    from = null,
    to = null,
    transaction = null,
  } = {}) {
    // employeeId, from, to がすべて指定されているか確認
    if (!employeeId || !from || !to) {
      const message = `[getEmployeeContracts] 従業員IDと取得する期間の指定が必要です。`
      logger.error(message, { employeeId, from, to })
      throw new Error(message)
    }

    try {
      // converter を使用するため、インスタンスを用意
      const instance = new this()

      const baseRef = firestore
        .collection('EmployeeContracts')
        .where('employeeId', '==', employeeId)

      // from より前の雇用契約を取得するクエリ
      const beforeQuery = baseRef
        .where('startDate', '<', from)
        .orderBy('startDate', 'desc')
        .limit(1)
        .withConverter(instance.converter())
      const beforeQuerySnapshot = transaction
        ? await transaction.get(beforeQuery)
        : await beforeQuery.get()

      // from 以降、to 以前の雇用契約を取得するクエリ
      const afterQuery = baseRef
        .where('startDate', '>=', from)
        .where('startDate', '<=', to)
        .withConverter(instance.converter())
      const afterQuerySnapshot = transaction
        ? await transaction.get(afterQuery)
        : await afterQuery.get()

      const before = beforeQuerySnapshot.docs.map((doc) => doc.data())
      const after = afterQuerySnapshot.docs.map((doc) => doc.data())

      return before.concat(after) // 前後の契約データを結合して返す
    } catch (error) {
      const message = `[getEmployeeContracts] 従業員の雇用契約情報の取得時にエラーが発生しました。`
      logger.error(message, { employeeId, from, to, error })
      throw error
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

/**
 * 従業員別の最新の雇用契約情報を管理するために、更に不要なプロパティを排除した
 * EmployeeContract クラスです。
 * - Realtime Database の従業員別最新雇用契約データを管理するために使用されます。
 */
export class EmployeeContractLatest extends EmployeeContractMinimal {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    // クラスで必要になるプロパティリスト
    const keepProps = [
      'docId',
      'employeeId',
      'startDate',
      'hasPeriod',
      'expiredDate',
    ]

    // 不要なプロパティを削除
    Object.keys(this).forEach((key) => {
      if (!keepProps.includes(key)) delete this[key]
    })
  }

  /****************************************************************************
   * 指定された従業員の、従業員別最新雇用契約データを削除します。
   * @param {string} employeeId - 対象の従業員ID
   ****************************************************************************/
  static async remove(employeeId) {
    const contractRef = database.ref(`EmployeeContractLatest/${employeeId}`)
    try {
      await contractRef.remove()
      logger.log(
        `従業員別最新雇用契約データを削除しました。従業員ID: ${employeeId}`
      )
    } catch (error) {
      logger.error(
        `従業員別最新雇用契約データの削除処理に失敗しました。従業員ID: ${employeeId}`
      )
    }
  }

  /****************************************************************************
   * 指定された従業員の最新の雇用契約ドキュメントを Firestore から取得します。
   * @param {string} employeeId - 対象の従業員ID
   * @returns
   ****************************************************************************/
  static async fetchLatest(employeeId) {
    try {
      const snapshot = await firestore
        .collection('EmployeeContracts')
        .where('employeeId', '==', employeeId)
        .orderBy('startDate', 'desc')
        .limit(1)
        .get()
      return snapshot.empty ? null : snapshot.docs[0].data()
    } catch (error) {
      logger.error(
        `従業員の最新雇用契約ドキュメントの取得に失敗しました。従業員ID: ${employeeId}`
      )
    }
  }

  /****************************************************************************
   * 指定された従業員の最新の雇用契約を取得し、Realtime Database に保存します。
   * - 対象の従業員が退職済みであった場合、または該当する雇用契約情報が存在しなかった場合
   *   Realtime Database からデータが削除されます。
   * @param {string} employeeId - 従業員ID
   ****************************************************************************/
  static async sync(employeeId) {
    const contractRef = database.ref(`EmployeeContractLatest/${employeeId}`)

    try {
      // 指定された従業員ドキュメントを取得
      const employeeSnapshot = await firestore
        .collection('Employees')
        .doc(employeeId)
        .get()

      // 従業員ドキュメントが存在しなかった場合は警告を出力してデータを削除、終了
      if (!employeeSnapshot.exists) {
        logger.warn(
          `Employees コレクションに対象のドキュメントが存在しません。従業員ID: ${employeeId}`
        )
        await this.remove(employeeId)
        return
      }

      // 在職中でない場合はデータを削除して終了
      const status = employeeSnapshot.data().status
      if (status !== 'active') {
        await this.remove(employeeId)
        return
      }

      // 最新の雇用契約ドキュメントを取得
      const latestContract = await this.fetchLatest(employeeId)

      // 雇用契約ドキュメントが存在しなければデータを削除して数量
      if (!latestContract) {
        await this.remove(employeeId)
        return
      }

      // 最新の雇用契約情報を Realtime Database に保存
      const instance = new this(latestContract)
      await contractRef.set(instance.toObject ? instance.toObject() : instance)
    } catch (error) {
      logger.error(
        `従業員（ID: ${employeeId}）の最新の雇用契約情報同期処理に失敗しました。`,
        {
          error,
        }
      )
      throw error
    }
  }
}
