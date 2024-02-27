import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: '', required: false },
    name1: { type: String, default: '', required: false },
    name2: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    zipcode: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    fax: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    deadline: { type: String, default: '99', required: false },
    depositMonth: { type: Number, default: 1, required: false },
    depositDate: { type: String, default: '99', required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## Customer
 *
 * @author shisyamo4131
 */
export default class Customer extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Customers'
    this.hasMany = [
      {
        collection: 'Sites',
        field: 'customerId',
        condition: '==',
        type: 'collection',
      },
    ]
    this.tokenFields = ['abbr', 'abbrKana']
    Object.keys(props.props).forEach((key) => {
      this[key] = props.props[key].default
    })
  }

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      this[key] = props.props[key].default
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
