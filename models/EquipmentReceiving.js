import FireModel from './FireModel'

const props = {
  props: {
    date: { type: String, default: '', required: false },
    items: { type: Array, default: () => [], required: false }, // { equipmentId, amount }
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## EquipmentReceiving
 * @author shisyamo4131
 */
export default class EquipmentReceiving extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'EquipmentReceivings'
    this.tokenFields = []
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
