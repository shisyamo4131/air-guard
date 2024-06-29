import FireModel from './FireModel'

const props = {
  props: {
    siteId: { type: String, default: '', required: false },
    startDate: { type: String, default: '', required: false },
    day: {
      type: Object,
      default: () => {
        return {
          startAt: '08:00',
          endAt: '17:00',
          endAtNextday: false,
          breakTime: 60,
          unitPrices: {
            weekdays: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            saturday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            sunday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            holiday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
          },
        }
      },
      required: false,
    },
    night: {
      type: Object,
      default: () => {
        return {
          startAt: '20:00',
          endAt: '05:00',
          endAtNextday: true,
          breakTime: 60,
          unitPrices: {
            weekdays: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            saturday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            sunday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
            holiday: {
              standard: { price: null, overtime: null },
              qualified: { price: null, overtime: null },
            },
          },
        }
      },
      required: false,
    },
    halfRate: { type: Number, default: 0.5, required: false },
    cancelRate: { type: Number, default: 1, required: false },
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
  constructor(context, item = {}) {
    super(context, item)
    // Object.defineProperties(this, {
    //   workTime: {
    //     enumerable: true,
    //     get() {
    //       if (!this.startDate) return 0
    //       if (!this.startAt || !this.endAt) return 0
    //       const start = new Date(`${this.startDate} ${this.startAt}`)
    //       const end = new Date(`${this.startDate} ${this.endAt}`)
    //       if (this.endAtNextday) end.setDate(end.getDate() + 1)
    //       const diff = (end.getTime() - start.getTime()) / 60 / 1000
    //       return diff - (this.breakTime || 0)
    //     },
    //     set(v) {},
    //   },
    // })
  }

  get collection() {
    return `Sites/${this.siteId}/SiteContracts`
  }

  set collection(v) {}

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  create() {
    const docId = this.startDate
    super.create(docId)
  }
}
