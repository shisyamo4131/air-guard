const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    startTime: { type: String, default: '', required: false },
    endTime: { type: String, default: '', required: false },
    endAtNextday: { type: Boolean, default: false, required: false },
    breakMinutes: { type: Number, default: null, required: false },
    workMinutes: { type: Number, default: null, required: false },
    overtimeMinutes: { type: Number, default: null, required: false },
    nighttimeMinutes: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    ojt: { type: Boolean, default: false, required: false },
  },
}
export { props }

export default class OperationResultWorker {
  constructor(item) {
    this.initialize(item)
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    if (!item) return
    Object.keys(item).forEach((key) => {
      if (key in this) {
        this[key] = JSON.parse(JSON.stringify(item[key]))
      }
    })
  }
}
