import { collection, getDocs, query, where } from 'firebase/firestore'
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
    withdrawReason: { type: String, default: '', required: false },
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
    Object.defineProperties(this, {
      months: {
        enumerable: true,
        get() {
          const result = [
            ...new Set(this.dates.map((date) => date.substring(0, 7))),
          ]
          return result
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

  async beforeCreate() {
    const path = `Employees/${this.employeeId}/EmployeeLeaveApplications`
    const colRef = collection(this.firestore, path)
    const q = query(colRef, where('docId', 'in', this.dates))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return
    const dates = querySnapshot.docs.map((doc) => doc.ref.id)
    throw new Error(`${dates}は別の休暇申請で受理しています。`)
  }

  async beforeUpdate() {
    const path = `Employees/${this.employeeId}/EmployeeLeaveApplications`
    const colRef = collection(this.firestore, path)
    const q = query(
      colRef,
      where('docId', 'in', this.dates),
      where('leaveApplicationId', '!=', this.docId)
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return
    const dates = querySnapshot.docs.map((doc) => doc.ref.id)
    throw new Error(`${dates}は別の休暇申請で受理しています。`)
  }
}
