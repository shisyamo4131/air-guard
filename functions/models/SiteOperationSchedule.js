/**
 * ## SiteOperationSchedule.js
 *
 * Cloud FunctionsでSiteOperationScheduleドキュメントを操作する際のドキュメントモデルです。
 *
 * @author shisyamo4131
 * @version 1.0.1
 *
 * @updates
 * - version 1.0.1 - 2027-07-29 - constructorで`addTimestamps`が`false`で固定されていた（なぜ？）。
 *                              - `options`としてすべての引数を受け付けるように修正。
 * - version 1.0.0 - 2024-07-26 - 初版作成
 */
const FireModel = require('./FireModel')

const props = {
  docId: { type: String, default: '', required: false },
  date: { type: String, default: '', required: false },
  dates: { type: Array, default: () => [], required: false },
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
  constructor(item, options) {
    super(item, options)
    Object.defineProperties(this, {
      /**
       * VCalendarコンポーネントで容易に使用できるよう、eventプロパティを定義。
       */
      event: {
        enumerable: true,
        get() {
          return {
            name: this.siteId,
            date: this.date,
            workShift: this.workShift,
            requiredWorkers: this.requiredWorkers,
            start: this.start,
            color: this.workShift === 'day' ? 'blue' : 'red',
          }
        },
        set(v) {},
      },
    })
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
