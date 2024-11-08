import { generateVueProps, generateClassProps } from './propsUtil'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 月次勤怠集計の実行記録
  calcAttendance: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
  },

  // 月次売上集計の実行記録
  calcMonthlySales: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
  },

  // 月次請求集計の実行記録
  calcSiteBillings: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
  },

  // 従業員の現場履歴更新処理の実行記録
  refreshEmployeeSiteHistory: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
  },

  // 現場の従業員入場履歴更新処理の実行記録
  refreshSiteEmployeeHistory: {
    type: Object,
    default: () => ({}),
    required: false,
    requiredByClass: false,
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
