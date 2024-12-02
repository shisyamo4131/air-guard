import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/WorkRegulation.js'

/**
 * Cloud Functions で Firestore の WorkRegulations ドキュメントを操作するためのクラスです。
 * FireMode を継承していますが、更新系のメソッドは利用できません。
 * @author shisyamo4131
 */
export default class WorkRegulation extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'WorkRegulations'
  static classProps = classProps

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

  /****************************************************************************
   * 週所定労働日数を返します。
   ****************************************************************************/
  get scheduledWorkDaysCount() {
    return this.scheduledWorkDays.length
  }

  /****************************************************************************
   * 所定労働時間（時間）を返します。
   ****************************************************************************/
  get scheduledWorkHoursPerDay() {
    const scheduledWorkMinutes = this.scheduledWorkMinutes ?? 0
    const MINUTES_PER_HOUR = 60
    return scheduledWorkMinutes / MINUTES_PER_HOUR
  }

  /****************************************************************************
   * 週所定労働時間（時間）を返します。
   ****************************************************************************/
  get scheduledWorkHoursPerWeek() {
    return this.scheduledWorkHoursPerDay * this.scheduledWorkDaysCount
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

/**
 * DailyAttendance クラスのカスタムクラス用 WorkRegulation クラスです。
 * - Minimal クラスから更に bonusEligibility, name プロパティを削除しています。
 */
export class WorkRegulationForDailyAttendance extends WorkRegulationMinimal {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)

    delete this.bonusEligibility
    delete this.name
  }
}
