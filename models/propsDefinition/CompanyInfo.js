/**
 * 自社情報ドキュメント定義
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

  // 会社名1
  name1: { type: String, default: '', required: true },

  // 会社名2
  name2: { type: String, default: '', required: false },

  // 郵便番号
  zipcode: { type: String, default: '', required: true },

  // 住所
  address1: { type: String, default: '', required: true },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // FAX番号
  fax: { type: String, default: '', required: false },

  // 法人番号
  corporateNumber: { type: String, default: '', required: false },

  // 代表者名
  executiveName: { type: String, default: '', required: false },

  // 代表者肩書
  executiveTitle: { type: String, default: '', required: false },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
