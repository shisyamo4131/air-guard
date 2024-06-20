import FireModel from './FireModel'

const props = {
  props: {
    name: { type: String, default: '', required: false },
    remarks: { type: String, default: '', required: false },
    code: { type: String, default: '', required: false },
    inventoryDate: { type: String, default: '', required: false },
    inventoryAmount: { type: Number, default: null, required: false },
  },
}
export { props }

/**
 * ## Equipment
 * @author shisyamo4131
 */
export default class Equipment extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Equipments'
    this.tokenFields = ['name']
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
