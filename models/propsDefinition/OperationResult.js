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
    default: 'weekdays',
    validator: (v) => ['weekdays', 'saturday', 'sunday', 'holiday'],
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
  siteContract: {
    type: Object,
    default: null,
    required: false,
    requiredByClass: true,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
