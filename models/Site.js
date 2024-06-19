/**
 * ## Site
 * @author shisyamo4131
 * @update 2024-06-19   favoriteの初期値をfalseに修正
 */
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    abbrNumber: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    startAt: { type: String, default: '', required: false },
    endAt: { type: String, default: '', required: false },
    securityType: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
    customerId: { type: String, default: '', required: false },
    favorite: { type: Boolean, default: false, required: false },
    // for bulk create.
    temporary: { type: Boolean, default: false, required: false },
    defaultDates: { type: Array, default: () => [], required: false },
    defaultSchedule: { type: Object, default: () => ({}), required: false },
  },
}
export { props }

export default class Site extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Sites'
    this.hasMany = [
      {
        collection: 'PlacementDetails',
        field: 'siteId',
        condition: '==',
        type: 'collection',
      },
    ]
    this.tokenFields = ['abbr', 'abbrKana']
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
