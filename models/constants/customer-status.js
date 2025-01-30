/**
 * 定数定義: 取引先状態
 */
export const CUSTOMER_STATUS = Object.freeze({
  active: '取引中',
  expired: '取引停止',
})

export const CUSTOMER_STATUS_ARRAY = Object.entries(CUSTOMER_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
