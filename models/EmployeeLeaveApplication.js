/**
 * EmployeeLeaveApplication.js
 * @version 1.0.0
 * @date 2024-06-20
 * @autor shisyamo4131
 *
 * 概要:
 * EmployeeLeaveApplicationクラスは、従業員の休暇申請を管理するためのモデルクラスです。
 * LeaveApplicationクラスを継承し、従業員ごとの休暇申請をサブコレクションとして管理します。
 * このクラスは直接的なCRUD操作を禁止し、Cloud FunctionsによってLeaveApplicationと同期されることを前提としています。
 *
 * 主な機能:
 * - Firestoreサブコレクション 'EmployeeLeaveApplications' に対する操作を禁止
 * - LeaveApplicationクラスの機能を継承
 *
 * 使用例:
 * 直接的な使用はできません。LeaveApplicationドキュメントの作成・更新・削除時にCloud Functionsによって同期されます。
 *
 * props設定:
 * このクラスで管理するプロパティは、LeaveApplicationクラスから継承され、追加でleaveApplicationIdプロパティを持ちます。
 * これにより、Mixinsを利用することでクラスに依存するコンポーネントのpropsを一元管理できます。
 *
 * injectの利用:
 * Nuxtのinjectを利用してコンポーネントからのアクセスを容易にすることも可能です。
 * plugins/models.js:
 * ---------------------------------------------------------------
 * import EmployeeLeaveApplication from '../models/EmployeeLeaveApplication'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('EmployeeLeaveApplication', (item) => new EmployeeLeaveApplication(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このクラスはCloud Functionsによって自動的に管理されるため、直接的なCRUD操作はできません。
 */
/* eslint-disable */
import LeaveApplication, { props as parentProps } from './LeaveApplication'

const props = {
  ...parentProps.props,
  leaveApplicationId: { type: String, default: '', required: false },
}
export { props }

export default class EmployeeLeaveApplication extends LeaveApplication {
  constructor(context, item = {}) {
    super(context, item)
  }

  get collection() {
    return `Employees/${this.employeeId}/EmployeeLeaveApplications`
  }

  set collection(v) {}

  create() {
    const message =
      'EmployeeLeaveApplicationドキュメントを直接作成することはできません。'
    console.warn(message)
    return Promise.reject(new Error(message))
  }

  update() {
    const message =
      'EmployeeLeaveApplicationドキュメントを直接更新することはできません。'
    console.warn(message)
    return Promise.reject(new Error(message))
  }

  delete() {
    const message =
      'EmployeeLeaveApplicationドキュメントを直接削除することはできません。'
    console.warn(message)
    return Promise.reject(new Error(message))
  }
}
