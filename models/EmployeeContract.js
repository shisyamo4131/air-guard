/**
 * ### EmployeeContract.js
 *
 * 従業員の雇用契約データモデルです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-17 - 初版作成
 */

import { doc, getDoc } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    employeeId: { type: String, default: '', required: false },
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

export default class SiteContract extends FireModel {
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
   * 同一の開始日付、勤務区分での取極めが存在する場合は作成不可です。
   */
  async beforeCreate() {
    if (await this.isExist()) {
      const errMsg = '同一契約日の雇用契約が既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
    if (!this.hasPeriod) this.expiredDate = ''
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
   * 指定された開始日、勤務区分での取極めが存在するかどうかを返します。
   */
  async isExist() {
    const path = `${this.collection}/${this.startDate}`
    const docRef = doc(this.firestore, path)
    const snapshot = await getDoc(docRef)
    return snapshot.exists()
  }
}
