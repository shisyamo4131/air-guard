/**
 * 手当ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { PAYMENT_TYPE } from '../constants/payment-types'
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
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
    validator: (v) => Object.keys(PAYMENT_TYPE).includes(v),
    required: true,
    requiredByClass: true,
  },

  // 時間外基礎に含める
  isIncludedInOvertimeBase: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
