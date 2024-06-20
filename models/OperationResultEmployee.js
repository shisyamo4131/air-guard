const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    workStartDate: { type: String, default: '', required: false },
    workStartTime: { type: String, default: '', required: false },
    workEndDate: { type: String, default: '', required: false },
    workEndTime: { type: String, default: '', required: false },
    breakTime: { type: Number, default: null, required: false },
    workTime: { type: Number, default: null, required: false },
    overTime: { type: Number, default: null, required: false },
    nightTime: { type: Number, default: null, required: false },
    qualified: { type: Boolean, default: false, required: false },
    ojt: { type: Boolean, default: false, required: false },
  },
}
export { props }

export default class OperationResultEmployee {
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
