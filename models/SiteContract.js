import FireModel from './FireModel'

const props = {
  props: {
    startDate: { type: String, default: '', required: false },
    workShift: { type: String, default: 'day', required: false },
    startAt: { type: String, default: '08:00', required: false },
    endAt: { type: String, default: '17:00', required: false },
    endAtNextday: { type: Boolean, default: false, required: false },
    breakTime: { type: Number, default: 60, required: false },
    halfRate: { type: Number, default: 0.5, required: false },
    cancelRate: { type: Number, default: 1, required: false },
    unitPrices: {
      type: Object,
      default: () => {
        return {
          weekdays: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          saturday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          sunday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          holiday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
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
    Object.defineProperties(this, {
      workTime: {
        enumerable: true,
        get() {
          if (!this.startDate) return 0
          if (!this.startAt || !this.endAt) return 0
          const start = new Date(`${this.startDate} ${this.startAt}`)
          const end = new Date(`${this.startDate} ${this.endAt}`)
          if (this.endAtNextday) end.setDate(end.getDate() + 1)
          const diff = (end.getTime() - start.getTime()) / 60 / 1000
          return diff - (this.breakTime || 0)
        },
        set(v) {},
      },
    })
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  create() {
    const docId = `${this.startDate}-${this.workShift}`
    super.create(docId)
  }
}
