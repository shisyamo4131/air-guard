import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: '', required: false },
    name1: { type: String, default: '', required: false },
    name2: { type: String, default: '', required: false },
    zipcode: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
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
    this.tokenFields = ['name1', 'name2', 'abbr', 'abbrKana']
    Object.keys(props.props).forEach((key) => {
      this[key] = props.props[key].default
    })
  }

  async beforeCreate() {
    if (!this.code) return true
    const exist = await this.fetchByCode(this.code)
    if (exist) throw new Error('既に使用されているCODEです。')
    return true
  }

  async beforeUpdate() {
    if (!this.code) return true
    const exist = await this.fetchByCode(this.code)
    if (exist && exist.docId !== this.docId)
      throw new Error('既に使用されているCODEです。')
    return true
  }

  async fetchByCode(code) {
    const colRef = collection(this.firestore, this.collection)
    const q = query(colRef, where('code', '==', code), limit(1))
    const snapshot = await getDocs(q)
    const result = snapshot.empty ? undefined : snapshot.docs[0].data()
    return result
  }
}
