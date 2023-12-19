/**
 * @author shisyamo4131
 */
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

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
  }

  initialize(item) {
    this.code = null
    this.name1 = null
    this.name2 = null
    this.abbr = null
    this.abbrKana = null
    this.address = null
    this.status = 'active'
    super.initialize(item)
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
