import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: undefined, default: null, required: false },
    lastName: { type: undefined, default: null, required: false },
    firstName: { type: undefined, default: null, required: false },
    lastNameKana: { type: undefined, default: null, required: false },
    firstNameKana: { type: undefined, default: null, required: false },
    abbr: { type: undefined, default: null, required: false },
    status: { type: undefined, default: null, required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## Employee
 * @author shisyamo4131
 */
export default class Employee extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Employees'
    this.hasMany = [
      {
        collection: 'PlacementDetails',
        field: 'workers',
        condition: 'array-contains',
        type: 'subcollection',
      },
    ]
    this.tokenFields = [
      'lastName',
      'firstName',
      'lastNameKana',
      'firstNameKana',
      'abbr',
    ]
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
