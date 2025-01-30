/**
 * 自動採番ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // コレクションID
  collectionId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 現在値
  current: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: true,
  },

  // 桁数
  length: {
    type: Number,
    default: 4,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  // フィールド名
  field: {
    type: String,
    default: 'code',
    required: false,
    requiredByClass: true,
  },

  // 状態
  status: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
