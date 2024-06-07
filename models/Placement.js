import FireModel from './FireModel'

const props = {
  props: {
    date: { type: String, default: '', required: false },
    siteId: { type: String, default: '', required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    start: { type: String, default: '', required: false },
    end: { type: String, default: '', required: false },
    numberOfWorkers: { type: Number, default: null, required: false },
    workers: { type: Array, default: () => [], required: false },
    outsourcers: { type: Array, default: () => [], required: false },
  },
}
export { props }

/**
 * ## Placement
 * @author shisyamo4131
 */
export default class Placement extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Placements'
    this.tokenFields = []
    Object.defineProperties(this, {
      month: {
        enumerable: true,
        get() {
          if (!this.date) return ''
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
