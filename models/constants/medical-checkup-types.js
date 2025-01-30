/**
 * 定数定義: 健康診断受診区分
 */
export const MEDICAL_CHECKUP_TYPE = Object.freeze({
  ENTRY: '入社時',
  REGULAR: '法定検診',
  OTHER: 'その他',
})

export const MEDICAL_CHECKUP_TYPE_ARRAY = Object.entries(
  MEDICAL_CHECKUP_TYPE
).map(([key, value]) => {
  return { value: key, text: value }
})
