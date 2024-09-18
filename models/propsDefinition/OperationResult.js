/**
 * ## OperationResults ドキュメントプロパティ定義
 *
 * @updates
 * - 2024-09-18 - `siteId`をコメントアウト。
 *                アプリ側から`site`オブジェクトをセットする仕様に変更し、
 *                `siteId`はObjectDefinePropertyで定義。
 *              ‐ `unitPrices`を追加。
 */
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  site: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
  date: { type: String, default: '', required: false, requiredByClass: true },
  dayDiv: {
    type: String,
    default: 'weekday',
    validator: (v) => ['weekday', 'saturday', 'sunday', 'holiday'],
    required: false,
    requiredByClass: true,
  },
  workShift: {
    type: String,
    default: 'day',
    validator: (v) => ['day', 'night'].includes(v),
    required: false,
    requiredByClass: true,
  },
  closingDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  workers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
  unitPrices: {
    type: Object,
    default: () => {
      return {
        standard: { price: 0, overtime: 0 },
        qualified: { price: 0, overtime: 0 },
      }
    },
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
