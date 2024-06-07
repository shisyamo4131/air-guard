import { collection, getDocs, limit, query, where } from 'firebase/firestore'
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
    requiredWorkers: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    workers: { type: Array, default: () => [], required: false },
    outsourcers: { type: Array, default: () => [], required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## SiteOperationSchedule
 * @author shisyamo4131
 */
export default class SiteOperationSchedule extends FireModel {
  constructor(context, item) {
    super(context, item)
    // this.collection = 'Placements'
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

  get collection() {
    return `Sites/${this.siteId}/SiteOperationSchedules`
  }

  set collection(v) {}

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  async beforeCreate() {
    const colRef = collection(this.firestore, this.collection)
    const q = query(
      colRef,
      where('date', '==', this.date),
      where('workShift', '==', this.workShift),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty)
      throw new Error('同一日、同一勤務区分の稼働予定が既に登録されています。')
  }

  async beforeUpdate() {
    const colRef = collection(this.firestore, this.collection)
    const q = query(
      colRef,
      where('docId', '!=', this.docId),
      where('date', '==', this.date),
      where('workShift', '==', this.workShift),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty)
      throw new Error('同一日、同一勤務区分の稼働予定が既に登録されています。')
  }
}
