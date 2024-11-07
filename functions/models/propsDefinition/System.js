import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },
  calcAttendance: {
    type: Object,
    default: () => {
      return {
        status: 'ready',
        lastExecutedAt: null,
        executeStatus: null,
        error: null,
      }
    },
    required: false,
    requiredByClass: true,
  },
  calcMonthlySales: {
    type: Object,
    default: () => {
      return {
        status: 'ready',
        lastExecutedAt: null,
        executeStatus: null,
        error: null,
      }
    },
    required: false,
    requiredByClass: true,
  },
  calcSiteBillings: {
    type: Object,
    default: () => {
      return {
        status: 'ready',
        lastExecutedAt: null,
        executeStatus: null,
        error: null,
      }
    },
    required: false,
    requiredByClass: true,
  },

  // 従業員の稼働履歴更新処理の実行記録
  refreshEmployeeSiteHistory: {
    type: Object,
    default: () => {
      return {
        status: 'ready',
        lastExecutedAt: null,
        executeStatus: null,
        error: null,
      }
    },
    required: false,
    requiredByClass: true,
  },

  // true の場合はメンテナンス中
  maintenanceMode: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: false,
  },

  // version 情報
  version: {
    type: String,
    default: '0.0.0',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
