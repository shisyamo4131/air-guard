/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class Employee extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Employees'
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.lastName && !this.firstName) return null
          return `${this.lastName} ${this.firstName}`
        },
      },
    })
  }

  initialize(item) {
    this.code = null
    this.lastName = null
    this.firstName = null
    this.lastNameKana = null
    this.firstNameKana = null
    this.abbr = null
    this.status = 'active'
    super.initialize(item)
  }
}
