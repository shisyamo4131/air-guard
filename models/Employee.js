/**
 * ### Employee.js
 *
 * 概要:
 * Employeeクラスは、従業員情報を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 *
 * 主な機能:
 * - Firestoreコレクション 'Employees' に対するCRUD操作
 * - LeaveApplications、AttendanceRecords、PlacementDetailsコレクションとのリレーションを管理
 * - 従業員情報のトークンフィールドによる検索サポート
 *
 * 使用例:
 * ---------------------------------------------------------------
 * import { firestore, auth } from '@/plugins/firebase';
 * import Employee from '@/models/Employee';
 *
 * const employee = new Employee({ firestore, auth }, { lastName: 'Sample', firstName: 'Example' });
 * employee.create().then(docRef => {
 *   console.log('Document created with ID: ', docRef.id);
 * });
 * ---------------------------------------------------------------
 *
 * props設定:
 * このクラスで管理するプロパティは、props.propsの中でvueコンポーネントのpropsのルールに合わせて定義しています。
 * これにより、Mixinsを利用することでクラスに依存するコンポーネントのpropsを一元管理できます。
 *
 * injectの利用:
 * Nuxtのinjectを利用してコンポーネントからのアクセスを容易にすることも可能です。
 * plugins/models.js:
 * ---------------------------------------------------------------
 * import Employee from '../models/Employee'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('Employee', (item) => new Employee(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * @author shisyamo4131
 * @date 2024-06-20
 * @version 1.2.0
 *
 * 更新履歴:
 * version 1.2.0 - 2024-07-02
 * - 生年月日、書類郵送先住所を追加
 * - 送付先住所が個別指定されなければ住所を送付先住所に複製
 * version 1.1.0 - 2024-07-01
 * - 血液型（bloodType）を追加
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
 */
import FireModel from './FireModel'

const props = {
  props: {
    code: { type: String, default: null, required: false },
    lastName: { type: String, default: null, required: false },
    firstName: { type: String, default: null, required: false },
    lastNameKana: { type: String, default: null, required: false },
    firstNameKana: { type: String, default: null, required: false },
    abbr: { type: String, default: null, required: false },
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
  },
}
export { props }

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
          if (!this.firstName || !this.lastName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.firstNameKana || !this.lastNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
        },
        set(v) {},
      },
    })
    this.initialize(item)
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
      if (!this.isForeigner) this.nationality = ''
      if (!this.leaveDate) this.leaveReason = ''
      // 送付先住所がなければ登録住所を送付先住所に複製
      if (!this.hasSendAddress) {
        this.sendZipcode = this.zipcode
        this.sendAddress1 = this.address1
        this.sendAddress2 = this.address2
      }
      return resolve()
    })
  }

  /**
   * ドキュメント更新前に実行されるメソッド
   * @returns Promise
   */
  beforeUpdate() {
    return new Promise((resolve) => {
      if (!this.isForeigner) this.nationality = ''
      if (!this.leaveDate) this.leaveReason = ''
      // 送付先住所がなければ登録住所を送付先住所に複製
      if (!this.hasSendAddress) {
        this.sendZipcode = this.zipcode
        this.sendAddress1 = this.address1
        this.sendAddress2 = this.address2
      }
      return resolve()
    })
  }
}
