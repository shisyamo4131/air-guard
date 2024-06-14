import FireModel from './FireModel'

const props = {
  props: {
    name: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    start: { type: String, default: '08:00', required: false },
    end: { type: String, default: '17:00', required: false },
    requiredWorkers: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    status: { type: String, default: 'accepted', required: false },
    remarks: { type: String, default: '', required: false },
    dates: { type: Array, default: () => [], required: false },
  },
}
export { props }

/**
 * ## TemporarySiteSchedule
 * @author shisyamo4131
 * @create 2024-06-14
 */
export default class TemporarySiteSchedule extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = `TemporarySiteSchedules`
    this.tokenFields = ['name']
    Object.defineProperties(this, {
      month: {
        enumerable: true,
        get() {
          return this.date.substring(0, 7)
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
