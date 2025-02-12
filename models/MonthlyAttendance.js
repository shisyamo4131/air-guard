import { FireModel } from 'air-firebase'
import { classProps } from './propsDefinition/MontlyAttendance'
import DailyAttendanceForMonthlyAttendance from './DailyAttendanceForMonthlyAttendance'

/**
 * ## MonthlyAttendancesドキュメントデータモデル【論理削除】
 *
 * @version 1.1.0
 * @author shisyamo4131
 * @updates
 * - version 1.1.0 - 2024-10-12 - customClassMap に DailyAttendance を設定
 * - version 1.0.0 - 2024-10-11 - 初版作成
 */
export default class MonthlyAttendance extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'MonthlyAttendances'
  static classProps = classProps

  /****************************************************************************
   * CUSTOM CLASS MAPPING
   ****************************************************************************/
  static customClassMap = {
    dailyAttendances: DailyAttendanceForMonthlyAttendance,
    dailyAttendancesPrev: DailyAttendanceForMonthlyAttendance,
    dailyAttendancesNext: DailyAttendanceForMonthlyAttendance,
  }

  toFreee() {
    return {
      従業員番号: this.employeeCode,
      氏名: '',
      性別: '',
      '所定労働時間（分）': this.scheduledWorkingMinutes,
      '法定内残業時間（分）': this.statutoryOvertimeMinutes,
      '時間外労働時間（分）': this.nonStatutoryOvertimeMinutes,
      '深夜労働時間（分）': this.nighttimeWorkingMinutes,
      '法定休日労働時間（分）': this.holidayWorkingMinutes,
      '総労働時間（分）': this.totalWorkingMinutes,
      総労働日数: this.totalWorkingDays,
      所定労働出勤日数: this.totalScheduledWorkingDays,
      所定休日出勤日数: this.totalNonScheduledWorkingDays,
      法定休日出勤日数: this.holidayWorkingDays,
      '遅刻時間（分）': this.lateMinutes,
      '早退時間（分）': this.leaveEarlyMinutes,
      欠勤日数: this.absentDays,
      遅刻日数: this.lateDays,
      早退日数: this.leaveEarlyDays,
      年休取得日数: this.annualPaidLeaveDays,
      集計開始日: this.startDate,
      集計終了日: this.endDate,
    }
  }
}

/**
 * 2025-02-12
 * dailyAttendances を保有したままVuexで読み込みを行うと非常に時間がかかる。
 * Minimalを用意して応急処置。
 */
export class MonthlyAttendanceMinimal extends MonthlyAttendance {
  initialize(item = {}) {
    super.initialize(item)

    delete this.dailyAttendances
    delete this.dailyAttendancesPrev
    delete this.dailyAttendancesNext
  }
}
