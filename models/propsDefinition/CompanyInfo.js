import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 会社名1
  name1: {
    type: String,
    default: '',
    required: true,
    requiredByClass: false,
  },

  // 会社名2
  name2: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 郵便番号
  zipcode: {
    type: String,
    default: '',
    required: true,
    requiredByClass: false,
  },

  // 住所
  address1: {
    type: String,
    default: '',
    required: true,
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

  // 法人番号
  corporateNumber: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 代表者名
  executiveName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 代表者肩書
  executiveTitle: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
