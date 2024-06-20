import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    zipcode: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    fax: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## Outsourcer
 * @author shisyamo4131
 */
export default class Outsourcer extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Outsourcers'
    // this.hasMany = [
    //   {
    //     collection: 'Sites',
    //     field: 'customerId',
    //     condition: '==',
    //     type: 'collection',
    //   },
    // ]
    this.tokenFields = ['abbr', 'abbrKana']
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
