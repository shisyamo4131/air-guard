import FireModel from './FireModel'

const props = {
  props: {
    startDate: { type: String, default: '', required: false },
    unitPrices: {
      type: Object,
      default: () => {
        return {
          day: {
            standard: {
              normal: 0,
              half: 0,
              canceled: 0,
              overtime: 0,
            },
            qualified: {
              normal: 0,
              half: 0,
              canceled: 0,
              overtime: 0,
            },
          },
          night: {
            standard: {
              normal: 0,
              half: 0,
              canceled: 0,
              overtime: 0,
            },
            qualified: {
              normal: 0,
              half: 0,
              canceled: 0,
              overtime: 0,
            },
          },
        }
      },
    },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## SiteContract
 *
 * @author shisyamo4131
 */
export default class SiteContract extends FireModel {
  constructor(context, siteId, item) {
    super(context, item)
    this.collection = `Sites/${siteId}/SiteContracts`
    this.siteId = siteId
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
