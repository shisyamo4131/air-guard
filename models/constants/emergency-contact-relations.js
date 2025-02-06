/**
 * 定数定義: 緊急連絡先続柄
 */
export const EMERGENCY_CONTACT_RELATION = Object.freeze({
  spouse: '配偶者',
  parent: '親',
  child: '子',
  brother: '兄弟',
  sister: '姉妹',
  other: 'その他',
})

export const EMERGENCY_CONTACT_RELATION_ARRAY = Object.entries(
  EMERGENCY_CONTACT_RELATION
).map(([key, value]) => {
  return { value: key, text: value }
})
