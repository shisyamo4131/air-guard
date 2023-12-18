/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class Application extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Applications'
    Object.defineProperties(this, {
      month: {
        enumerable: true,
        get() {
          if (!this.applicationDate) return null
          return this.applicationDate.substr(0, 7)
        },
        set(v) {},
      },
    })
  }

  initialize(item) {
    this.applicationDate = null
    this.applicationType = 'vacation'
    this.employeeId = null
    this.dates = []
    this.reason = null
    this.approvedDate = null
    this.approvedUid = null
    this.status = 'unapproved'
    this.rejectReason = null
    super.initialize(item)
  }
}
