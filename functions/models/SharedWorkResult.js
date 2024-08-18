/**
 * ## SharedWorkResult
 *
 * このファイルは、稼働実績に関連する共通プロパティを定義しています。
 * これらのプロパティは、`OperationResultWorker` クラスおよび `OperationWorkResult` クラスで共有されています。
 * 両クラスのプロパティ定義を一元管理することで、変更が生じた際に
 * このファイルを修正するだけで、両クラスに自動的に反映されるようになります。
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
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-08-16 - 初版作成
 *
 * @example
 * const sharedWorkResultProperties = require('./SharedWorkResult');
 *
 * // OperationResultWorkerクラスでの使用例
 * class OperationResultWorker {
 *   constructor(item = {}) {
 *     Object.keys(sharedWorkResultProperties).forEach((key) => {
 *       this[key] = item[key] !== undefined ? item[key] : sharedWorkResultProperties[key].default;
 *     });
 *   }
 *
 *   toObject() {
 *     return { ...this };
 *   }
 * }
 *
 * // OperationWorkResultクラスでの使用例
 * const FireModelV2 = require('./FireModelV2');
 *
 * class OperationWorkResult extends FireModelV2 {
 *   constructor(item = {}) {
 *     super(item);
 *     Object.keys(sharedWorkResultProperties).forEach((key) => {
 *       this[key] = item[key] !== undefined ? item[key] : sharedWorkResultProperties[key].default;
 *     });
 *   }
 *
 *   toObject() {
 *     return { ...super.toObject() };
 *   }
 * }
 *
 * module.exports = sharedWorkResultProperties;
 */

const sharedWorkResultProperties = {
  employeeId: {
    type: String,
    default: '',
  },
  startTime: {
    type: String,
    default: '',
  },
  endTime: {
    type: String,
    default: '',
  },
  endAtNextday: {
    type: Boolean,
    default: false,
  },
  breakMinute: {
    type: Number,
    default: null,
  },
  workMinute: {
    type: Number,
    default: null,
  },
  overtimeMinute: {
    type: Number,
    default: null,
  },
  nighttimeMinute: {
    type: Number,
    default: null,
  },
  qualification: {
    type: Boolean,
    default: false,
  },
  ojt: {
    type: Boolean,
    default: false,
  },
}

module.exports = sharedWorkResultProperties
