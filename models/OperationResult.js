import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: null, required: false },
    date: { type: String, default: '', required: false },
    site: { type: Object, default: null, required: false },
    securityType: { type: String, default: '', required: false },
    employees: { type: Array, default: [], required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night', 'else'].includes(v),
      required: false,
    },
    sales: { type: Number, default: null, required: false },
    workers: {
      type: Object,
      default() {
        return {
          standard: { normal: 0, half: 0, canceled: 0 },
          qualified: { normal: 0, half: 0, canceled: 0 },
        }
      },
      required: false,
    },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## OperationResult
 * @author shisyamo4131
 */
export default class OperationResult extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'OperationResults'
    // this.hasMany = [
    //   {
    //     collection: 'PlacementDetails',
    //     field: 'workers',
    //     condition: 'array-contains',
    //     type: 'subcollection',
    //   },
    // ]
    this.tokenFields = []
    Object.defineProperties(this, {
      month: {
        enumerable: true,
        get() {
          return this.date ? this.date.substring(0, 7) : ''
        },
        set(v) {},
      },
    })
  }

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  /**
   * 指定されたcodeに該当するドキュメントが存在するかどうかを返します。
   * 存在すれば該当ドキュメントの参照を、存在しなければundefinedを返します。
   * @param {string} code
   * @returns 該当するドキュメントの参照です。
   */
  async isCodeExist(code) {
    const colRef = collection(this.firestore, this.collection)
    const q = query(colRef, where('code', '==', code), limit(1))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return undefined
    } else {
      return querySnapshot.docs[0].ref
    }
  }
}
