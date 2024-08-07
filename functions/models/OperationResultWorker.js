/**
 * ## OperationResultWorker
 *
 * 稼働実績稼働従業員データモデル
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @update
 * - version 1.0.0 - 2024-08-07 - 初版作成
 */
class OperationResultWorker {
  constructor(item) {
    this.employeeId = item?.employeeId || ''
    this.startTime = item?.startTime || ''
    this.endTime = item?.endTime || ''
    this.endAtNextday = item?.endAtNextday || false
    this.breakMinute = item?.breakMinute || null
    this.workMinute = item?.workMinute || null
    this.overtimeMinute = item?.overtimeMinute || null
    this.nighttimeMinute = item?.nighttimeMinute || null
    this.qualification = item?.qualification || false
    this.ojt = item?.ojt || false
  }
}

module.exports = OperationResultWorker
