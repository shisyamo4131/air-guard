/**
 * ## SiteOperationSchedule.js
 *
 * Cloud FunctionsでSiteOperationScheduleドキュメントを操作する際のドキュメントモデルです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */
const FireModel = require('./FireModel')

const props = {
  docId: { type: String, default: '', required: false },
  date: { type: String, default: '', required: false },
  siteId: { type: String, default: '', required: false },
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
  },
  start: { type: String, default: '', required: false },
  end: { type: String, default: '', required: false },
  requiredWorkers: { type: Number, default: null, required: false },
  qualification: { type: Boolean, default: false, required: false },
  workers: { type: Array, default: () => [], required: false },
  outsourcers: { type: Array, default: () => [], required: false },
  remarks: { type: String, default: '', required: false },
}

class SiteOperationSchedule extends FireModel {
  constructor(item) {
    super(item, { addTimestamps: false })
  }

  initialize(item = {}) {
    Object.keys(props).forEach((key) => {
      const propDefault = props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}

module.exports = SiteOperationSchedule
