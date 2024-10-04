/**
 * ## OperationResults ドキュメントプロパティ定義
 *
 * @version 1.3.0
 * @updates
 * - version 1.3.0 - 2024-10-04 - Added `isLocked` property.
 * - version 1.2.0 - 2024-10-02 - `siteId` プロパティを追加。
 *                              - `OperationResult` クラスで上書きされるプロパティを定義。
 *                                `OperationBillingBasis` クラスでそのまま使用する。
 * - version 1.1.0 - 2024-10-01 - 外注先を受け入れるためのプロパティとして `outsourcers` を追加。
 */
import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  code: { type: String, default: '', required: false, requiredByClass: false },
  siteId: { type: String, default: '', required: false, requiredByClass: true },
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
  outsourcers: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // 以下、Object.definePropertyで上書きされるプロパティ
  employeeIds: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  outsourcerIds: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },
  month: { type: String, default: '', required: false, requiredByClass: true },
  operationCount: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtimeMinutes: 0,
        },
        qualified: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtimeMinutes: 0,
        },
        total: 0,
        overtimeMinutes: 0,
      }
    },
    required: false,
    requiredByClass: true,
  },
  siteContractId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  unitPrice: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: null,
          half: null,
          cancel: null,
          overtime: null,
        },
        qualified: {
          normal: null,
          half: null,
          cancel: null,
          overtime: null,
        },
        halfRate: null,
        cancelRate: null,
      }
    },
    required: false,
    requiredByClass: true,
  },
  sales: {
    type: Object,
    default: () => {
      return {
        standard: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtime: 0,
        },
        qualified: {
          normal: 0,
          half: 0,
          cancel: 0,
          total: 0,
          overtime: 0,
        },
        total: 0,
      }
    },
    required: false,
    requiredByClass: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
