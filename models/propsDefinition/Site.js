/**
 * 現場ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { SECURITY_TYPE } from '../constants/security-types'
import { SITE_STATUS } from '../constants/site-status'
import { CustomerMinimal } from '../Customer'
import { generateProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 取引先ID
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 取引先ドキュメント
  customer: {
    type: Object,
    default: null,
    required: false,
    validator: (v) => v instanceof CustomerMinimal,
    requiredByClass: true,
  },

  // 現場code
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 現場名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 現場名略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 略称コード（取引先から指定された現場のコードなど）
  abbrNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 住所
  address: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 開始日
  startAt: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 終了日
  endAt: { type: String, default: '', required: false, requiredByClass: false },

  // 警備種別
  securityType: {
    type: String,
    default: '',
    required: false,
    validator: (v) => !v || Object.keys(SECURITY_TYPE).includes(v),
    requiredByClass: true,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(SITE_STATUS).includes(v),
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // お気に入りフラグ
  favorite: {
    type: Boolean,
    default: false,
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

  // スポット現場フラグ
  isSpot: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // 現場取極め存在フラグ
  hasContract: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps }
