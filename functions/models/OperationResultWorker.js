const sharedWorkResultProperties = require('./SharedWorkResult')

/**
 * ## OperationResultWorker
 *
 * 稼働実績稼働従業員データモデル
 *
 * このクラスは、稼働実績に関連する従業員データを管理します。`SharedWorkResult` で定義されたプロパティを利用して、
 * 従業員に関する情報を一元管理します。これにより、従業員データに関するプロパティが変更された場合、
 * `SharedWorkResult` を修正するだけで済むため、メンテナンス性が向上します。
 *
 * @property {string} employeeId - 従業員の一意の識別子
 * @property {string} startTime - 勤務開始時間 (フォーマット: "HH:mm")
 * @property {string} endTime - 勤務終了時間 (フォーマット: "HH:mm")
 * @property {boolean} endAtNextday - 勤務終了が翌日になるかどうかを示すフラグ
 * @property {number|null} breakMinute - 休憩時間 (分単位)。休憩がない場合は `null`
 * @property {number|null} workMinute - 実働時間 (分単位)。計算されていない場合は `null`
 * @property {number|null} overtimeMinute - 残業時間 (分単位)。残業がない場合は `null`
 * @property {number|null} nighttimeMinute - 深夜勤務時間 (分単位)。深夜勤務がない場合は `null`
 * @property {boolean} qualification - 従業員が資格を保有しているかどうかを示すフラグ
 * @property {boolean} ojt - 従業員がOJT（On-the-Job Training）を実施したかどうかを示すフラグ
 *
 * @method toObject - クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
 *
 * @example
 * const worker = new OperationResultWorker({
 *   employeeId: '12345',
 *   startTime: '09:00',
 *   endTime: '17:00',
 * });
 * console.log(worker.toObject());
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 */
class OperationResultWorker {
  /**
   * コンストラクタ
   * @param {Object} item - 従業員データを含むオブジェクト
   */
  constructor(item = {}) {
    Object.keys(sharedWorkResultProperties).forEach((key) => {
      this[key] =
        item[key] !== undefined
          ? item[key]
          : sharedWorkResultProperties[key].default
    })
  }

  /**
   * クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
   * @returns {Object} - 変換されたオブジェクト
   */
  toObject() {
    return { ...this }
  }
}

module.exports = OperationResultWorker
