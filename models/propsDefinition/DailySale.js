/**
 * 日次売上ドキュメント定義
 * - ドキュメントの作成、更新処理は Cloud Function 側で行われます。
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

  // 売上日（YYYY-MM-DD）
  date: { type: String, default: '', required: false, requiredByClass: true },

  // 売上月（YYYY-MM）
  month: { type: String, default: '', required: false, requiredByClass: true },

  // 売上年（YYYY）
  year: { type: String, default: '', required: false, requiredByClass: true },

  /**
   * 稼働実績ドキュメント配列
   * - 当該売り上げの根拠となる稼働実績ドキュメントの配列
   */
  operationResults: { type: Array, default: () => [], required: false },

  /**
   * 売上高
   * - 将来、稼働実績以外での売上計上の可能性を鑑みてネストしている。
   */
  amount: {
    type: Object,
    default: () => {
      return {
        operationResults: 0,
      }
    },
    required: false,
  },

  // 消費税
  consumptionTax: {
    type: Number,
    default: null,
    required: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
