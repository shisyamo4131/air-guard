import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: null, required: false },
    lastName: { type: String, default: null, required: false },
    firstName: { type: String, default: null, required: false },
    lastNameKana: { type: String, default: null, required: false },
    firstNameKana: { type: String, default: null, required: false },
    abbr: { type: String, default: null, required: false },
    gender: { type: String, default: 'male', required: false },
    zipcode: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    mobile: { type: String, default: '', required: false },
    hireDate: { type: String, default: '', required: false },
    leaveDate: { type: String, default: '', required: false },
    leaveReason: { type: String, default: '', required: false },
    isForeigner: { type: Boolean, default: false, required: false },
    nationality: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## Employee
 * @author shisyamo4131
 */
export default class Employee extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Employees'
    this.hasMany = [
      {
        collection: 'PlacementDetails',
        field: 'workers',
        condition: 'array-contains',
        type: 'subcollection',
      },
    ]
    this.tokenFields = ['lastNameKana', 'firstNameKana', 'abbr']
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.firstName || !this.lastName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.firstNameKana || !this.lastNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
        },
        set(v) {},
      },
    })
  }

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  beforeCreate() {
    return new Promise((resolve, reject) => {
      if (!this.isForeigner) this.nationality = ''
      if (!this.leaveDate) this.leaveReason = ''
      return resolve()
    })
  }

  beforeUpdate() {
    return new Promise((resolve, reject) => {
      if (!this.isForeigner) this.nationality = ''
      if (!this.leaveDate) this.leaveReason = ''
      return resolve()
    })
  }
}
