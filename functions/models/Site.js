/**
 * ### Site
 *
 * #### OUTLINE
 * Cloud FunctionsでSiteドキュメントを操作する際のドキュメントモデル。
 *
 * #### UPDATE
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
const FireModel = require('./FireModel')

const props = {
  docId: { type: String, default: '', required: false },
  customer: { type: Object, default: null, required: false },
  code: { type: String, default: '', required: false },
  name: { type: String, default: '', required: false },
  abbr: { type: String, default: '', required: false },
  abbrKana: { type: String, default: '', required: false },
  abbrNumber: { type: String, default: '', required: false },
  address: { type: String, default: '', required: false },
  startAt: { type: String, default: '', required: false },
  endAt: { type: String, default: '', required: false },
  securityType: { type: String, default: '', required: false },
  status: { type: String, default: 'active', required: false },
  remarks: { type: String, default: '', required: false },
  favorite: { type: Boolean, default: false, required: false },
  sync: { type: Boolean, default: false, required: false },
  // for spot site and bulk create.
  isSpot: { type: Boolean, default: false, required: false },
  defaultDates: { type: Array, default: () => [], required: false },
  defaultSchedule: { type: Object, default: () => ({}), required: false },
}

class Site extends FireModel {
  constructor(item) {
    super(item, { addTimestamps: false })
    this.tokenFields = ['abbr', 'abbrKana']
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

module.exports = Site
