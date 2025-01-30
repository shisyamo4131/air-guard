/**
 * 制服・装備品ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { EQUIPMENT_STATUS } from '../constants/equipment-status'
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 制服・装備品名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // コード
  code: { type: String, default: '', required: false, requiredByClass: false },

  // 色・サイズ
  colorSize: { type: String, default: '', required: false },

  // 備考
  remarks: { type: String, default: '', required: false },

  /**
   * ステータス
   */
  status: {
    type: String,
    default: 'active',
    validator: (v) => Object.keys(EQUIPMENT_STATUS).includes(v),
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
