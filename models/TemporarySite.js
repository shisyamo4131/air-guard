import FireModel from './FireModel'

const props = {
  props: {
    name: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    dates: { type: Array, default: () => [], required: false },
    numberOfWorkers: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    workShift: { type: String, default: 'day', required: false },
    start: { type: String, default: '08:00', required: false },
    end: { type: String, default: '17:00', required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## TemporarySite
 * @author shisyamo4131
 */
export default class TemporarySite extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'TemporarySites'
    this.tokenFields = ['name']
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
