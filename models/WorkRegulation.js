import { FireModel } from 'air-firebase'
import { accessor, classProps } from './propsDefinition/WorkRegulation'

/**
 * 就業規則を管理するデータモデルです。
 * @author shisyamo4131
 */
export default class WorkRegulation extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'WorkRegulations'
  static classProps = classProps
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'workRegulation.docId',
      condition: '==',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    Object.defineProperties(this, {
      scheduledWorkMinutes: accessor.scheduledWorkMinutes,
    })
  }

  /****************************************************************************
   * 週所定労働時間（時間）を返します。
   ****************************************************************************/
  get scheduledWorkHoursPerWeek() {
    const scheduledWorkMinutes = this.scheduledWorkMinutes ?? 0
    const scheduledWorkDaysCount = this.scheduledWorkDays.length
    const MINUTES_PER_HOUR = 60
    return (scheduledWorkMinutes * scheduledWorkDaysCount) / MINUTES_PER_HOUR
  }

  /****************************************************************************
   * beforeCreate をオーバーライドします。
   * - isHolidayWorkDay が true の場合 holidays を初期化します。
   * @returns Promise
   ****************************************************************************/
  beforeCreate() {
    return new Promise((resolve) => {
      if (this.isHolidayWorkDay) this.holidays.splice(0)
      resolve()
    })
  }

  /****************************************************************************
   * beforeUpdate をオーバーライドします。
   * - isHolidayWorkDay が true の場合 holidays を初期化します。
   * @returns Promise
   ****************************************************************************/
  beforeUpdate() {
    return new Promise((resolve) => {
      if (this.isHolidayWorkDay) this.holidays.splice(0)
      resolve()
    })
  }
}

/**
 * WorkRegulation クラスからカスタムクラス用に不要なプロパティを削除したクラスです。
 */
export class WorkRegulationMinimal extends WorkRegulation {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.createAt
    delete this.updateAt
    delete this.remarks
    delete this.tokenMap
  }
}
