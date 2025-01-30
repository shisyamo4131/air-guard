/**
 * 定数定義: 従業員状態
 */
export const EQUIPMENT_STATUS = Object.freeze({
  active: '有効',
  expired: '無効',
})

export const EQUIPMENT_STATUS_ARRAY = Object.entries(EQUIPMENT_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
