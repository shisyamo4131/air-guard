const dayjs = require('dayjs')
const FireModel = require('./FireModel')
const { classProps } = require('./propsDefinition/WorkRegulation')
/**
 * WorkRegulationsドキュメントデータモデル【物理削除】
 *
 * - 就業規則を管理するデータモデルです。
 *
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-09-13 - 初版作成
 */
class WorkRegulation extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(
      item,
      'WorkRegulations',
      [
        {
          collection: 'EmployeeContracts',
          field: 'workRegulationId',
          condition: '==',
          type: 'collection',
        },
      ],
      false,
      [],
      classProps
    )

    Object.defineProperties(this, {
      /**
       * 所定労働時間
       * - 始業時刻、終業時刻、休憩時間から計算した所定労働時間（分）です。
       */
      scheduledWorkMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          // 始業・終業時刻が無効な場合、0を返す
          if (!this.startTime || !this.endTime) return 0
          const [sHour, sMinute] = this.startTime.split(':')
          const [eHour, eMinute] = this.endTime.split(':')

          // 始業・終業時刻のフォーマットが不正な場合、0を返す
          if (
            sHour === undefined ||
            sMinute === undefined ||
            eHour === undefined ||
            eMinute === undefined
          )
            return 0

          // 始業時刻と終業時刻をdayjsで扱う
          const from = dayjs().hour(Number(sHour)).minute(Number(sMinute))
          const to = dayjs().hour(Number(eHour)).minute(Number(eMinute))
          const diff = to.diff(from, 'minute')

          // 休憩時間を差し引いた所定労働時間を返す
          return diff - (this.breakMinutes || 0)
        },
        set() {
          // setterは使用されないため、何もしない
        },
      },
    })
  }
}

module.exports = WorkRegulation
