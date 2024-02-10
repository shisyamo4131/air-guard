import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    customerId: { type: String, default: '', required: false },
    code: { type: String, default: '', required: false },
    name: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    abbrKana: { type: String, default: '', required: false },
    customerCode: { type: String, default: '', required: false },
    address: { type: String, default: '', required: false },
    startAt: { type: String, default: '', required: false },
    endAt: { type: String, default: '', required: false },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## Site
 * @author shisyamo4131
 */
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
    this.tokenFields = ['name', 'abbr', 'abbrKana', 'address']
    Object.keys(props.props).forEach((key) => {
      this[key] = props.props[key].default
    })
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
