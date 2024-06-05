import FireModel from './FireModel'

const props = {
  props: {
    date: { type: String, default: '', required: false },
    workShift: { type: String, default: 'day', required: false },
    start: { type: String, default: '08:00', required: false },
    numberOfWorkers: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    month: { type: String, default: '', required: false },
    status: { type: String, default: 'accepted', required: false },
    end: { type: String, default: '17:00', required: false },
    parent: { type: Object, default: () => ({}), required: false },
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
    // this.collection = ``
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

  get collection() {
    return `TemporarySites/${this.parent.docId}/TemporarySiteSchedules`
  }

  set collection(v) {
    super.collection(v)
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
    await super.create(this.date)
  }
}
