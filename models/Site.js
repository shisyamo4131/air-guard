/**
 * @author shisyamo4131
 */
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

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
  }

  initialize(item) {
    this.code = null
    this.name = null
    this.abbr = null
    this.abbrKana = null
    this.address = null
    this.customerId = null
    this.status = 'active'
    this.synchronized = false
    super.initialize(item)
  }

  async beforeCreate() {
    if (!this.code) return true
    const exist = await this.fetchByCode(this.code)
    if (exist) throw new Error('既に使用されているCODEです。')
    this.synchronized = true
    return true
  }

  async beforeUpdate() {
    if (!this.code) return true
    const exist = await this.fetchByCode(this.code)
    if (exist && exist.docId !== this.docId)
      throw new Error('既に使用されているCODEです。')
    this.synchronized = true
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
