/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class Application extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Applications'
  }

  initialize(item) {
    this.applicationDate = null
    this.applicationType = 'vacation'
    this.employeeId = null
    this.dates = []
    this.reason = null
    this.approvedDate = null
    this.approvedId = null
    this.status = 'unapproved'
    this.rejectReason = null
    super.initialize(item)
  }
}
