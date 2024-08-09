/**
 * ### EmployeeContract.js
 *
 * 従業員の雇用契約データモデルです。
 *
 * #### 注意事項
 * 1. ドキュメント作成時、従業員情報を取得して`employee`プロパティにセットします。
 * 2. ドキュメント更新時には従業員情報は取得・更新されません。
 *    -> Employeeドキュメントのサブコレクションであるため。
 * 3. Employeeドキュメントが更新された時の同期処理はCloud Functionsで行われます。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-08-09 - `fetchByEmployeeId()`を実装。
 *                              - `fetchByEmployeeIds()`を実装。
 * - version 1.1.0 - 2024-07-19 - ドキュメント作成時に従業員情報を取得するように修正
 * - version 1.0.0 - 2024-07-17 - 初版作成
 */

import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    employeeId: { type: String, default: '', required: false },
    employee: { type: Object, default: () => ({}), required: false },
    workRegulationId: { type: String, default: '', required: false },
    startDate: { type: String, default: '', required: false },
    hasPeriod: { type: Boolean, default: true, required: false },
    expiredDate: { type: String, default: '', required: false },
    contractType: {
      type: String,
      default: 'part-time',
      validator: (v) => ['part-time', 'contract', 'full-time'],
      required: false,
    },
    paymentType: {
      type: String,
      default: 'daily',
      validator: (v) => ['daily', 'monthly'],
    },
    basicWage: { type: Number, default: null, required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

export default class EmployeeContract extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
  }

  get collection() {
    return `Employees/${this.employeeId}/EmployeeContracts`
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

  /**
   * 同一の開始日付、勤務区分での雇用契約が存在する場合は作成不可です。
   */
  async beforeCreate() {
    if (await this.isExist()) {
      const errMsg = '同一契約日の雇用契約が既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
    if (!this.hasPeriod) this.expiredDate = ''
    this.employee = await this.getEmployee()
    if (!this.employee) {
      throw new Error('従業員情報が取得できませんでした。')
    }
  }

  beforeUpdate() {
    return new Promise((resolve) => {
      if (!this.hasPeriod) this.expiredDate = ''
      resolve()
    })
  }

  /**
   * `docId`を`${startDate}-${workShift}`に固定します。
   */
  async create() {
    const docId = `${this.startDate}`
    await super.create({ docId })
  }

  /**
   * 指定された開始日、勤務区分での雇用契約が存在するかどうかを返します。
   */
  async isExist() {
    const path = `${this.collection}/${this.startDate}`
    const docRef = doc(this.firestore, path)
    const snapshot = await getDoc(docRef)
    return snapshot.exists()
  }

  async getEmployee() {
    const docRef = doc(this.firestore, `Employees/${this.employeeId}`)
    const snapshot = await getDoc(docRef)
    return snapshot.exists() ? snapshot.data() : undefined
  }

  /**
   * 指定された従業員の雇用契約データを取得して配列で返します。
   * @param {string} employeeId 従業員のドキュメントid
   * @returns {Promise<Array>} 雇用契約ドキュメントデータの配列
   */
  async fetchByEmployeeId(employeeId) {
    const colRef = collectionGroup(this.firestore, 'EmployeeContracts')
    const q = query(colRef, where('employeeId', '==', employeeId))
    const snapshots = await getDocs(q)
    if (snapshots.empty) return []
    return snapshots.docs.map((doc) => doc.data())
  }

  /**
   * 従業員のドキュメントidの配列を受け取り、該当する雇用契約ドキュメントデータを配列で返します。
   * 従業員のドキュメントidの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} ids
   * @returns {Promise<Array>} 雇用契約ドキュメントデータの配列
   */
  async fetchByEmployeeIds(ids) {
    const unique = [...new Set(ids)]
    const chunked = unique.flatMap((_, i) =>
      i % 30 ? [] : [unique.slice(i, i + 30)]
    )
    const colRef = collectionGroup(this.firestore, 'EmployeeContracts')
    const snapshots = await Promise.all(
      chunked.map(async (arr) => {
        const q = query(colRef, where('employeeId', 'in', arr))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
    )
    return snapshots.flat()
  }
}
