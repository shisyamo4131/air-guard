import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },

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
    validator: (v) => ['daily', 'monthly'].includes(v),
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
