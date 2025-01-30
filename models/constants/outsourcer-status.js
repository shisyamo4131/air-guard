/**
 * 定数定義: 外注先状態
 */
export const OUTSOURCER_STATUS = Object.freeze({
  active: '取引中',
  expired: '取引停止',
})

export const OUTSOURCER_STATUS_ARRAY = Object.entries(OUTSOURCER_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
