import FireModel from './FireModel'

const props = {
  props: {
    requestDate: { type: String, default: '', required: false },
    type: { type: String, default: 'non-paid', required: false },
    employeeId: { type: String, default: '', required: false },
    dates: { type: Array, default: () => [], required: false },
    reason: { type: String, default: '', required: false },
    status: { type: String, default: 'unapproved', required: false },
    settlementDate: { type: String, default: '', required: false },
    rejectReason: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ### LeaveApplication
 * @author shisyamo4131
 */

export default class LeaveApplication extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'LeaveApplications'
  }

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
