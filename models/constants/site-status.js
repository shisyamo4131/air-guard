/**
 * 定数定義: 現場状態
 */
export const SITE_STATUS = Object.freeze({
  active: '稼働中',
  expired: '終了',
})

export const SITE_STATUS_ARRAY = Object.entries(SITE_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
