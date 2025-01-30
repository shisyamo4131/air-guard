/**
 * 取引先ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { CUSTOMER_STATUS } from '../constants/customer-status'
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先code
  code: { type: String, default: '', required: false },

  // 取引先名1
  name1: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名2
  name2: { type: String, default: '', required: false },

  // 取引先名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 取引先名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 郵便番号
  zipcode: {
    type: String,
    default: '',
    required: false,
  },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 建物名・階数
  address2: {
    type: String,
    default: '',
    required: false,
  },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 状態
  status: {
    type: String,
    default: 'active',
    validator: (v) => Object.keys(CUSTOMER_STATUS).includes(v),
    required: false,
    requiredByClass: true,
  },

  // 締日
  deadline: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（月）
  depositMonth: {
    type: Number,
    default: 1,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  // 入金サイト（日）
  depositDate: {
    type: String,
    default: '99',
    validator: (v) => ['05', '10', '15', '20', '25', '99'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
  },

  // 同期状態
  sync: {
    type: Boolean,
    default: false,
    required: false,
  },

  // 自社情報フラグ
  isInternal: {
    type: Boolean,
    default: false,
    required: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
