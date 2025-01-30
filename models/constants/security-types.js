/**
 * 定数定義: 警備種別
 */
export const SECURITY_TYPE = Object.freeze({
  'newly-training': '新任教育',
  traffic: '交通誘導警備',
  jam: '雑踏警備',
  facility: '施設警備',
  patrol: '巡回警備',
  other: 'その他',
})

export const SECURITY_TYPE_ARRAY = Object.entries(SECURITY_TYPE).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
