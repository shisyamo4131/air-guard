/**
 * 定数定義: 支給形態
 */
export const PAYMENT_TYPE = Object.freeze({
  monthly: '1:月給（月ごと）',
  daily: '2:日給（日ごと）',
  hourly: '3:時間給（時間ごと）',
})

export const PAYMENT_TYPE_ARRAY = Object.entries(PAYMENT_TYPE).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
