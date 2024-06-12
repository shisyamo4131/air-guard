import FireModel from './FireModel'

const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    month: { type: String, default: '', required: false },
    scheduledWorkingTime: { type: Number, default: null, required: false },
    statutoryOverTime: { type: Number, default: null, required: false },
    nonStatutoryOverTime: { type: Number, default: null, required: false },
    holidayWorkingTime: { type: Number, default: null, required: false },
    midnightWorkingTime: { type: Number, default: null, required: false },
    scheduledWorkingDays: { type: Number, default: null, required: false },
    statutoryWorkingDays: { type: Number, default: null, required: false },
    holidayWorkingDays: { type: Number, default: null, required: false },
    absenceDays: { type: Number, default: null, required: false },
    annualVacationDays: { type: Number, default: null, required: false },
  },
}
export { props }

/**
 * ## AttendanceRecord
 * @author shisyamo4131
 */
export default class AttendanceRecord extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'AttendanceRecords'
    Object.defineProperties(this, {
      overTimeTotal: {
        enumerable: true,
        get() {
          return this.nonStatutoryOverTime + this.holidayWorkingTime
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

  async create() {
    await super.create(this.employeeId + this.month)
  }
}
