/**
 * ### Customer
 *
 * #### OUTLINE
 * Cloud FunctionsでCustomerドキュメントを操作する際のドキュメントモデル。
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
  code: { type: String, default: '', required: false },
  name1: { type: String, default: '', required: false },
  name2: { type: String, default: '', required: false },
  abbr: { type: String, default: '', required: false },
  abbrKana: { type: String, default: '', required: false },
  zipcode: { type: String, default: '', required: false },
  address1: { type: String, default: '', required: false },
  address2: { type: String, default: '', required: false },
  tel: { type: String, default: '', required: false },
  fax: { type: String, default: '', required: false },
  status: { type: String, default: 'active', required: false },
  deadline: { type: String, default: '99', required: false },
  depositMonth: { type: Number, default: 1, required: false },
  depositDate: { type: String, default: '99', required: false },
  remarks: { type: String, default: '', required: false },
  sync: { type: Boolean, default: false, required: false },
}

class Customer extends FireModel {
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

module.exports = Customer
