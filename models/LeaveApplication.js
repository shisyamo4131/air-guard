import { collection, getDocs, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    requestDate: { type: String, default: '', required: false },
    type: { type: String, default: 'non-paid', required: false },
    employeeId: { type: String, default: '', required: false },
    dates: { type: Array, default: () => [], required: false },
    reason: { type: String, default: '', required: false },
    status: { type: String, default: 'unapproved', required: false },
    settlementDate: { type: String, default: '', required: false },
    rejectReason: { type: String, default: '', required: false },
    withdrawReason: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * LeaveApplication.js
 * @version 1.0.0
 * @date 2024-06-20
 * @author shisyamo4131
 *
 * 概要:
 * LeaveApplicationクラスは、従業員の休暇申請を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 * LeaveApplicationドキュメントは休暇対象日の分だけ、Employees/${docId}/EmployeeLeaveApplicationsに複製されます。
 * EmployeeLeaveApplicationsドキュメントにはdocIdとして休暇対象日、親のドキュメントIDとしてleaveApplicationIdが付与されます。
 *
 * 主な機能:
 * - Firestoreコレクション 'LeaveApplications' に対するCRUD操作
 * - 休暇申請のバリデーション機能
 * - 休暇申請の日付に関する情報を取得する機能
 *
 * 使用例:
 * ---------------------------------------------------------------
 * import { firestore, auth } from '@/plugins/firebase';
 * import LeaveApplication from '@/models/LeaveApplication';
 *
 * const leaveApplication = new LeaveApplication({ firestore, auth }, { employeeId: 'sampleEmployee', dates: ['2024-06-20'] });
 * leaveApplication.create().then(docRef => {
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
 * import LeaveApplication from '../models/LeaveApplication'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('LeaveApplication', (item) => new LeaveApplication(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
 */

export default class LeaveApplication extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'LeaveApplications'
    Object.defineProperties(this, {
      months: {
        enumerable: true,
        get() {
          const result = [
            ...new Set(this.dates.map((date) => date.substring(0, 7))),
          ]
          return result
        },
        set(v) {},
      },
    })
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  async beforeCreate() {
    const path = `Employees/${this.employeeId}/EmployeeLeaveApplications`
    const colRef = collection(this.firestore, path)
    const q = query(colRef, where('docId', 'in', this.dates))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return
    const dates = querySnapshot.docs.map((doc) => doc.ref.id)
    throw new Error(`${dates}は別の休暇申請で受理しています。`)
  }

  async beforeUpdate() {
    const path = `Employees/${this.employeeId}/EmployeeLeaveApplications`
    const colRef = collection(this.firestore, path)
    const q = query(
      colRef,
      where('docId', 'in', this.dates),
      where('leaveApplicationId', '!=', this.docId)
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return
    const dates = querySnapshot.docs.map((doc) => doc.ref.id)
    throw new Error(`${dates}は別の休暇申請で受理しています。`)
  }
}
