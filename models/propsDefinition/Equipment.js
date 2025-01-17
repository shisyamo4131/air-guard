import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  /**
   * ドキュメントID
   */
  docId: { type: String, default: '', required: false, requiredByClass: false },

  /**
   * 名称
   */
  name: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * コード
   */
  code: { type: String, default: '', required: false, requiredByClass: false },

  /**
   * 色・サイズ
   */
  colorSize: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * 備考
   */
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  /**
   * ステータス
   */
  status: {
    type: String,
    default: 'active',
    validator: (v) => ['active', 'expired'].includes(v),
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
