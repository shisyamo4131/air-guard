/**
 * ## OperationResult.js
 *
 * Cloud FunctionsでOperationResultドキュメントを操作する際のドキュメントモデルです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-07 - 初版作成
 */
const FireModel = require('./FireModel')

const props = {
  docId: { type: String, default: '', required: false },
  code: { type: String, default: '', required: false },
  siteId: { type: String, default: '', required: false },
  site: { type: Object, default: () => ({}), required: false },
  date: { type: String, default: '', required: false },
  dayDiv: {
    type: String,
    default: 'weekday',
    validator: (v) => ['weekday', 'saturday', 'sunday', 'holiday'],
    required: false,
  },
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
  },
  deadline: { type: String, default: '', required: false },
  workers: { type: Array, default: () => [], required: false },
  remarks: { type: String, default: '', required: false },
}

class OperationResult extends FireModel {
  initialize(item = {}) {
    Object.keys(props).forEach((key) => {
      const propDefault = props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}

module.exports = OperationResult
