/*****************************************************************************
 * カスタムクラス定義: 手当 - Allowance -
 *
 * @author shisyamo4131
 * @refact 2025-01-30
 *****************************************************************************/
import { FireModel } from 'air-firebase'
import { PAYMENT_TYPE } from './constants/payment-types'
import { generateProps } from './propsDefinition/propsUtil'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 手当名
  name: { type: String, default: '', required: true, requiredByClass: true },

  // 手当名カナ
  nameKana: {
    type: String,
    default: '',
    required: true,
    requiredByClass: true,
  },

  // 支給形態
  paymentType: {
    type: String,
    default: 'daily',
    required: true,
    requiredByClass: true,
    validator: (v) => Object.keys(PAYMENT_TYPE).includes(v),
  },

  // 時間外基礎に含める
  isIncludedInOvertimeBase: {
    type: Boolean,
    default: true,
    required: false,
  },

  // 備考
  remarks: { type: String, default: '', required: false },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Allowance extends FireModel {
  // FireModel 設定
  static collectionPath = 'Allowances'
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['name', 'nameKana']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'allowanceIds',
      condition: 'array-contains',
      type: 'collection',
    },
  ]
}

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class AllowanceMinimal extends Allowance {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
    delete this.remarks
    delete this.createAt
    delete this.updateAt
    delete this.uid
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }
}
