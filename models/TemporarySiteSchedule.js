import FireModel from './FireModel'

const props = {
  props: {
    name: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    numberOfPeople: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    workShift: { type: String, default: 'day', required: false },
    dates: { type: Array, default: () => [], required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## TemporarySiteSchedule
 * @author shisyamo4131
 */
export default class TemporarySiteSchedule extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'TemporarySiteSchedules'
    this.tokenFields = ['name']
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
}
