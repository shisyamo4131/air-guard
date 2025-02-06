/**
 * 定数定義: 手続状況
 */

// 健康保険
export const HEALTH_INSURANCE_PROCESSING_STATUS = Object.freeze({
  IN_PROGRESS: '手続中',
  COMPLETED: '完了',
})

export const HEALTH_INSURANCE_PROCESSING_STATUS_ARRAY = Object.entries(
  HEALTH_INSURANCE_PROCESSING_STATUS
).map(([key, value]) => {
  return { value: key, text: value }
})

// 厚生年金
export const PENSION_PROCESSING_STATUS = Object.freeze({
  IN_PROGRESS: '手続中',
  COMPLETED: '完了',
})

export const PENSION_PROCESSING_STATUS_ARRAY = Object.entries(
  PENSION_PROCESSING_STATUS
).map(([key, value]) => {
  return { value: key, text: value }
})

// 雇用保険
export const EMPLOYMENT_INSURANCE_PROCESSING_STATUS = Object.freeze({
  IN_PROGRESS: '手続中',
  COMPLETED: '完了',
})

export const EMPLOYMENT_INSURANCE_PROCESSING_STATUS_ARRAY = Object.entries(
  EMPLOYMENT_INSURANCE_PROCESSING_STATUS
).map(([key, value]) => {
  return { value: key, text: value }
})
