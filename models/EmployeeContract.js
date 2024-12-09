import { FireModel } from 'air-firebase'
import { EmployeeMinimal } from './Employee'
import { accessor, classProps } from './propsDefinition/EmployeeContract'
import { WorkRegulationMinimal } from './WorkRegulation'
import EmployeeAllowance from './EmployeeAllowance'

/**
 * 従業員の雇用契約情報を管理するデータモデルです。
 * @author shisyamo4131
 */
export default class EmployeeContract extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'EmployeeContracts'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employee: EmployeeMinimal,
    workRegulation: WorkRegulationMinimal,
    allowances: EmployeeAllowance,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    Object.defineProperties(this, {
      allowanceIds: accessor.allowanceIds,
    })
  }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - `employeeId`、`startDate`の入力チェックを行います。
   * - `employeeId`と`startDate`が同一である他のドキュメントが存在した場合はエラーをスローします。
   * - `employeeId`に該当する`employee`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
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
      const employee = await new EmployeeMinimal().fetchDoc(this.employeeId)
      if (!employee) {
        throw new Error('従業員情報が取得できませんでした。')
      }
      this.employee = employee

      // 契約期間の定めがなければ契約満了日に空文字列をセット
      if (!this.hasPeriod) this.expiredDate = ''

      // 就業規則情報の取得とセット
      const workRegulationInstance = new WorkRegulationMinimal()
      const workRegulation = await workRegulationInstance.fetchDoc(
        this.workRegulationId
      )
      if (!workRegulation) {
        throw new Error('就業規則情報が取得できませんでした。')
      }
      this.workRegulation = workRegulation
      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line
      console.error(
        `[EmployeeContract.js beforeCreate] Error fetching employee: ${err.message}`
      )
      throw err
    }
  }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - `employeeId`、`startDate`が変更されていないかをチェックします。
   * - validatePropertiesを行う為、super.beforeUpdateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   * @throws {Error} - 従業員、契約日が変更されている場合にエラーをスローします。
   ****************************************************************************/
  async beforeUpdate() {
    const match = this.docId.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/) // YYYY-MM-DD形式の日付部分をキャプチャ
    if (!match) {
      throw new Error('docIdの形式が正しくありません。')
    }

    const [, employeeId, startDate] = match // 分割した結果を格納
    if (employeeId !== this.employeeId || startDate !== this.startDate) {
      throw new Error('従業員、契約日は変更できません。')
    }

    // 契約期間の定めがなければ契約満了日に空文字列をセット
    if (!this.hasPeriod) this.expiredDate = ''

    // 就業規則が変更されていれば就業規則情報を取得してセット
    if (this.workRegulationId !== this.workRegulation.docId) {
      const workRegulationInstance = new WorkRegulationMinimal()
      const workRegulation = await workRegulationInstance.fetchDoc(
        this.workRegulationId
      )
      if (!workRegulation) {
        throw new Error('就業規則情報が取得できませんでした。')
      }
      this.workRegulation = workRegulation
    }
    await super.beforeUpdate()
  }

  /****************************************************************************
   * createをオーバーライドします。
   * - ドキュメントIDを`${employeeId}-${startDate}`に固定します。
   * - super.create({docId})を呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async create() {
    const docId = `${this.employeeId}-${this.startDate}`
    return await super.create({ docId })
  }

  /****************************************************************************
   * 指定された複数の`employeeId`に該当するドキュメントを取得します。
   * - 30件ずつチャンクに分けてFirestoreにクエリを実行します。
   * - 各クエリ結果をまとめて返します。
   *
   * @param {Array<string>} ids - 取得対象のemployeeIdの配列
   * @returns {Promise<Array>} - 一致するドキュメントの配列を返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
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

  /****************************************************************************
   * 指定された`employeeId`に該当する最新の雇用契約ドキュメントを返します。
   * - date が指定された場合, date 以前の最新の1件を返します。
   * - 該当するものがない場合は null を返します。
   *
   * @param {Object} params - パラメータオブジェクト
   * @param {string} params.employeeId - 取得対象のemployeeId
   * @param {string|null} [params.date=null] - 指定された場合、その日付以前の最新のドキュメントを取得
   * @returns {Promise<Object|null>} - 一致するドキュメント、またはnullを返すPromise
   * @throws {Error} ドキュメント取得中にエラーが発生した場合にエラーをスローします
   ****************************************************************************/
  static async getLatest({ employeeId, date = null }) {
    if (!employeeId) {
      throw new Error(
        '[getLatest] 必須の引数 employeeId が指定されていません。'
      )
    }

    const instance = new this()

    try {
      const conditions = [
        ['where', 'employeeId', '==', employeeId],
        ['orderBy', 'startDate', 'desc'],
        ['limit', 1],
      ]

      if (date) {
        conditions.splice(1, 0, ['where', 'startDate', '<=', date])
      }

      const result = await instance.fetchDocs(conditions)
      return result.length ? result[0] : null
    } catch (err) {
      const message = '[getLatest] ドキュメント取得中にエラーが発生しました。'
      // eslint-disable-next-line no-console
      console.error(message, { employeeId, date, error: err })
      throw err
    }
  }
}
