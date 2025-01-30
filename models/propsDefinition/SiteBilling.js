/**
 * 現場別請求明細ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  /**
   * ドキュメントID
   * ${siteId}-${closingDate}
   */
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 取引先ID
  customerId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 現場ID
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 締め日（YYYY-MM-DD）
  closingDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 請求年月（YYYY-MM）
  month: { type: String, default: '', required: false, requiredByClass: true },

  // 請求年（YYYY）
  year: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * 稼働実績ドキュメント配列
   * - 請求の根拠となる稼働実績ドキュメントの配列
   */
  operationResults: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 金額（税抜請求額）
  amount: {
    type: Object,
    default: () => {
      return {
        operationResults: 0,
      }
    },
    required: false,
    requiredByClass: false,
  },

  /**
   * 消費税率と消費税額の配列
   * - 計算期間中に消費税率が変更される可能性があるため、税率ごとに金額を計算し、これを要素とした配列で管理する。
   * - 消費税率や消費税額は稼働実績ドキュメントが保有している。
   */
  consumptionTaxs: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 消費税額（consumptionTaxs.amount の合計）
  consumptionTax: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
