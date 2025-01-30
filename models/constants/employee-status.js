/**
 * 定数定義: 従業員状態
 */
export const EMPLOYEE_STATUS = Object.freeze({
  active: '在籍',
  expired: '退職',
})

export const EMPLOYEE_STATUS_ARRAY = Object.entries(EMPLOYEE_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
