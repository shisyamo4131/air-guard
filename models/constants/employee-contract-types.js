/**
 * 定数定義: 雇用形態
 */
export const EMPLOYEE_CONTRACT_TYPE = Object.freeze({
  executive: '役員',
  'full-time': '正社員',
  contract: '契約社員',
  'part-time': 'アルバイト',
})

export const EMPLOYEE_CONTRACT_TYPE_ARRAY = Object.entries(
  EMPLOYEE_CONTRACT_TYPE
).map(([key, value]) => {
  return { value: key, text: value }
})
