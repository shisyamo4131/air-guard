/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class LeaveApplication extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'LeaveApplications'
  }

  initialize(item) {
    this.requestDate = null
    this.type = 'non-paid'
    this.employeeId = null
    this.date = null
    this.reason = null
    this.status = 'unapproved'
    this.settlementDate = null
    this.settlementUid = null
    this.rejectReason = null
    super.initialize(item)
  }
}
