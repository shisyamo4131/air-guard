/**
 * ### Employee
 *
 * #### OUTLINE
 * Cloud FunctionsでEmployeeドキュメントを操作する際のドキュメントモデル。
 *
 * #### UPDATE
 * - version 1.0.0 - 2024-07-16 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
const FireModel = require('./FireModel')

const props = {
  docId: { type: String, default: '', required: false },
  code: { type: String, default: '', required: false },
  lastName: { type: String, default: '', required: false },
  firstName: { type: String, default: '', required: false },
  lastNameKana: { type: String, default: '', required: false },
  firstNameKana: { type: String, default: '', required: false },
  abbr: { type: String, default: '', required: false },
  gender: { type: String, default: 'male', required: false },
  birth: { type: String, default: '', required: false },
  zipcode: { type: String, default: '', required: false },
  address1: { type: String, default: '', required: false },
  address2: { type: String, default: '', required: false },
  hasSendAddress: { type: Boolean, default: false, required: false },
  sendZipcode: { type: String, default: '', required: false },
  sendAddress1: { type: String, default: '', required: false },
  sendAddress2: { type: String, default: '', required: false },
  tel: { type: String, default: '', required: false },
  mobile: { type: String, default: '', required: false },
  hireDate: { type: String, default: '', required: false },
  leaveDate: { type: String, default: '', required: false },
  leaveReason: { type: String, default: '', required: false },
  isForeigner: { type: Boolean, default: false, required: false },
  nationality: { type: String, default: '', required: false },
  bloodType: {
    type: String,
    default: '-',
    validator: (v) => ['A', 'B', 'O', 'AB', '-'].includes(v),
    required: false,
  },
  status: { type: String, default: 'active', required: false },
  remarks: { type: String, default: '', required: false },
  imgRef: { type: String, default: '', required: false },
  // Prepared by function.
  fullName: { type: String, default: '', required: false },
  fullNameKana: { type: String, default: '', required: false },
  sync: { type: Boolean, default: false, required: false },
}

class Employee extends FireModel {
  constructor(item) {
    super(item, { addTimestamps: false })
    this.tokenFields = ['lastNameKana', 'firstNameKana', 'abbr']
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.lastName || !this.firstName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.lastNameKana || !this.firstNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
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

module.exports = Employee
