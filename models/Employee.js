/**
 * ### Employee.js
 *
 * 概要:
 * Employeeクラスは、従業員情報を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 *
 * @updates
 * - version 1.3.0 - 2024-07-03 - updateImgRef()を実装
 * - version 1.2.0 - 2024-07-02 - 生年月日、書類郵送先住所を追加
 *                              - 送付先住所が個別指定されなければ住所を送付先住所に複製
 *                              - fullName、fullNameKanaをpropsに定義
 * - version 1.1.0 - 2024-07-01 - 血液型（bloodType）を追加
 * - version 1.0.0 - 2024-06-20 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.3.0
 */
import { doc, updateDoc } from 'firebase/firestore'
import FireModel from './FireModel'

export const props = {
  props: {
    docId: { type: String, default: '', required: false },
    code: { type: String, default: '', required: false },
    lastName: { type: String, default: '', required: false },
    firstName: { type: String, default: '', required: false },
    lastNameKana: { type: String, default: '', required: false },
    firstNameKana: { type: String, default: '', required: false },
    abbr: { type: String, default: '', required: false },
    gender: { type: String, default: 'male', required: false },
    birth: { type: String, default: '', required: false },
    zipcode: { type: String, default: '', required: false },
    address1: { type: String, default: '', required: false },
    address2: { type: String, default: '', required: false },
    hasSendAddress: { type: Boolean, default: false, required: false },
    sendZipcode: { type: String, default: '', required: false },
    sendAddress1: { type: String, default: '', required: false },
    sendAddress2: { type: String, default: '', required: false },
    tel: { type: String, default: '', required: false },
    mobile: { type: String, default: '', required: false },
    hireDate: { type: String, default: '', required: false },
    leaveDate: { type: String, default: '', required: false },
    leaveReason: { type: String, default: '', required: false },
    isForeigner: { type: Boolean, default: false, required: false },
    nationality: { type: String, default: '', required: false },
    bloodType: {
      type: String,
      default: '-',
      validator: (v) => ['A', 'B', 'O', 'AB', '-'].includes(v),
      required: false,
    },
    status: { type: String, default: 'active', required: false },
    remarks: { type: String, default: '', required: false },
    imgRef: { type: String, default: '', required: false },
    // Prepared by function.
    fullName: { type: String, default: '', required: false },
    fullNameKana: { type: String, default: '', required: false },
    sync: { type: Boolean, default: false, required: false },
  },
}

export default class Employee extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Employees'
    this.hasMany = [
      {
        collection: 'LeaveApplications',
        field: 'employeeId',
        condition: '==',
        type: 'collection',
      },
      {
        collection: 'AttendanceRecords',
        field: 'employeeId',
        condition: '==',
        type: 'collection',
      },
      {
        collection: 'PlacementDetails',
        field: 'workers',
        condition: 'array-contains',
        type: 'subcollection',
      },
    ]
    this.tokenFields = ['lastNameKana', 'firstNameKana', 'abbr']
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.lastName || !this.firstName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.lastNameKana || !this.firstNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
        },
        set(v) {},
      },
    })
  }

  /**
   * 初期化メソッド
   * @param {object} item - 初期化するアイテムオブジェクト
   */
  initialize(item = {}) {
    // デフォルト値を設定
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    // 親クラスのinitializeメソッドを呼び出し
    super.initialize(item)
  }

  /**
   * ドキュメント作成前に実行されるメソッド
   * @returns Promise
   */
  beforeCreate() {
    return new Promise((resolve) => {
      this.prepareData()
      resolve()
    })
  }

  /**
   * ドキュメント更新前に実行されるメソッド
   * @returns Promise
   */
  beforeUpdate() {
    return new Promise((resolve) => {
      this.prepareData()
      resolve()
    })
  }

  prepareData() {
    if (!this.isForeigner) this.nationality = ''
    if (!this.leaveDate) this.leaveReason = ''
    // 送付先住所がなければ登録住所を送付先住所に複製
    if (!this.hasSendAddress) {
      this.sendZipcode = this.zipcode
      this.sendAddress1 = this.address1
      this.sendAddress2 = this.address2
    }
  }

  /**
   * 従業員ドキュメントのイメージファイルパスを更新します。
   * @param {string} docId - 従業員ID
   * @param {string} url - イメージファイルのフルパス
   */
  async updateImgRef(docId, url) {
    const docRef = doc(this.firestore, `Employees/${docId}`)
    try {
      await updateDoc(docRef, { imgRef: url })
    } catch (err) {
      // eslint-disable-next-line
      console.error(err)
      throw err
    }
  }
}
