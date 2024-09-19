import { FireModel } from 'air-firebase'
import Employee from './Employee'
import { classProps } from './propsDefinition/AttendanceRecord'

/**
 * AttendanceRecordsドキュメントデータモデル【物理削除】
 *
 * - AttendanceRecordsは従業員の勤怠実績を月ごとに集計したデータです。
 * - MS-Access版AirGuardから出力されたデータを取り込む際にのみ使用されます。（2024-08-22時点）
 * - アプリ側からデータが作成・更新・削除されることは想定されていませんので、モデル側での入力チェックは行っていません。
 * - アプリ側からデータを操作する必要がある場合、モデル内で入力チェックを行うように修正されるべきです。
 * - `docId`は`${employeeId}-${month}`です。
 *
 * 注意事項:
 * - AttendanceRecordsドキュメントは従業員の月別勤怠実績を確認するための機能として一時的に実装するものです。
 * - MS-Access版AirGuardから出力されたcsvデータをドキュメントとして取り込みますが、取り込み時は既存ドキュメントがすべて削除されます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class AttendanceRecord extends FireModel {
  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    employee: Employee,
  }

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'AttendanceRecords', [], false, [], classProps)
    Object.defineProperties(this, {
      overTimeTotal: {
        enumerable: true,
        get() {
          return this.nonStatutoryOverTime + this.holidayWorkingTime
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - スーパークラスの `fromFirestore` メソッドを呼び出して基本のインスタンスを取得します。
   * - 取得した `employee` データを `Employee` クラスのインスタンスに変換します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    const instance = super.fromFirestore(snapshot)
    instance.employee = new Employee(instance.employee)
    return instance
  }

  /****************************************************************************
   * createメソッドを無効化します。
   * - アプリ側で AttendanceRecords ドキュメントを作成することはできません。
   * @returns {Promise<never>} - 常に拒否された Promise を返します。
   ****************************************************************************/
  create() {
    return Promise.reject(
      new Error(
        '[AttendanceRecord.js] アプリではAttendanceRecordsドキュメントを作成できません。'
      )
    )
  }
  // 仮にアプリ側でAttendanceRecordsドキュメントを作成する場合はこちらを有効化
  // async create() {
  //   // `docId` を `${employeeId}-${month}` に固定します。
  //   await super.create({ docId: this.employeeId + this.month })
  // }

  /****************************************************************************
   * beforeCreateをオーバーライドします。
   * - `employeeId`に該当する`employee`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeCreateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    try {
      if (!this.employeeId) {
        throw new Error('従業員の指定が必要です。')
      }
      const employee = await new Employee().fetchDoc(this.employeeId)
      if (!employee) {
        throw new Error('従業員情報が取得できませんでした。')
      }
      this.employee = employee
      await super.beforeCreate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message)
      throw err
    }
  }

  /****************************************************************************
   * updateメソッドを無効化します。
   * - アプリ側でAttendanceRecordsドキュメントを更新することはできません。
   * @returns {Promise<never>} - 常に拒否された Promise を返します。
   ****************************************************************************/
  update() {
    return Promise.reject(
      new Error(
        '[AttendanceRecord.js] アプリではAttendanceRecordsドキュメントを更新できません。'
      )
    )
  }

  // 仮にアプリ側でAttendanceRecordsドキュメントを更新する場合はこちらを有効化
  // beforeUpdate() {
  //   const [employeeId, month] = this.docId
  //   if(employeeId !== this.employeeId || month !== this.month){
  //     throw new Error(`[AttendanceRecords.js] 従業員IDまたは年月を変更することはできません。`)
  //   }
  // }

  /****************************************************************************
   * beforeUpdateをオーバーライドします。
   * - `employeeId`に該当する`employee`オブジェクトを取得・セットします。
   * - validatePropertiesを行う為、super.beforeUpdateを呼び出します。
   * @returns {Promise<void>} - 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    try {
      if (!this.employeeId) {
        throw new Error('従業員の指定が必要です。')
      }
      if (this.employeeId !== this.employee.docId) {
        const employee = await new Employee().fetchDoc(this.employeeId)
        if (!employee) {
          throw new Error('従業員情報が取得できませんでした。')
        }
        this.employee = employee
      }
      await super.beforeUpdate()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message)
      throw err
    }
  }

  /****************************************************************************
   * deleteメソッドを無効化します。
   * - アプリ側でAttendanceRecordsドキュメントを削除することはできません。
   ****************************************************************************/
  delete() {
    return Promise.reject(
      new Error(
        '[AttendanceRecord.js] アプリではAttendanceRecordsドキュメントを削除できません。'
      )
    )
  }

  /****************************************************************************
   * MS-Access版AirGuardから出力された勤怠実績データをAttendanceRecordsドキュメント
   * としてインポートします。
   * - 既存のドキュメントはすべて削除されます。
   * @param {Array<Object>} data MS-Access版AirGuardから出力されたcsvデータ
   * @returns すべての処理が完了すると解決されるPromise
   ****************************************************************************/
  async importFromAirGuard(data) {
    try {
      // 既存ドキュメントをすべて削除します。
      await this.deleteAll()

      // data内に含まれる`code`（列名は`employeeId`）からemployeesドキュメントを取得
      const employeeModel = new Employee()
      const employees = await employeeModel.fetchByCodes(
        data.map(({ employeeId }) => employeeId)
      )

      // dataの各値をAttendanceRecordsドキュメント用に変換する。
      const newItems = data.map((item) => {
        item.employeeId = employees.find(
          ({ code }) => code === item.employeeId
        ).docId
        item.employee = employees.find(({ docId }) => docId === item.employeeId)
        item.scheduledWorkingTime = parseInt(item.scheduledWorkingTime)
        item.statutoryOverTime = parseInt(item.statutoryOverTime)
        item.nonStatutoryOverTime = parseInt(item.nonStatutoryOverTime)
        item.holidayWorkingTime = parseInt(item.holidayWorkingTime)
        item.midnightWorkingTime = parseInt(item.midnightWorkingTime)
        item.scheduledWorkingDays = parseInt(item.scheduledWorkingDays)
        item.statutoryWorkingDays = parseInt(item.statutoryWorkingDays)
        item.holidayWorkingDays = parseInt(item.holidayWorkingDays)
        item.absenceDays = parseInt(item.absenceDays)
        item.annualVacationDays = parseInt(item.annualVacationDays)
        return item
      })

      // 変換後のデータをAttendanceRecordsドキュメントとして作成する。
      const promises = newItems.map(async (item) => {
        const newModel = new this(item)
        await newModel.create()
      })
      await Promise.all(promises)
    } catch (err) {
      // eslint-disable-next-line
      console.error(err)
      throw err
    }
  }
}
