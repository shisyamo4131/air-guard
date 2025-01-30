/**
 * 外注先ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { OUTSOURCER_STATUS } from '../constants/outsourcer-status'
import { generateProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 外注先code
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 外注先名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 外注先略称カナ
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
    requiredByClass: false,
  },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 建物名・階数
  address2: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 電話番号
  tel: { type: String, default: '', required: false, requiredByClass: false },

  // FAX番号
  fax: { type: String, default: '', required: false, requiredByClass: false },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(OUTSOURCER_STATUS).includes(v),
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 同期状態
  sync: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps }
