/**
 * 指定された日付と締日区分をもとに締日を返す関数
 * @param {string} dateString - YYYY-MM-DD形式の日付文字列
 * @param {string} closingCode - 締日区分 ('05', '10', '15', '20', '25', '99')
 * @returns {string} - 締日をYYYY-MM-DD形式で返す
 */
export function getClosingDate(dateString, closingCode) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 月は0から始まるため、1を加える

  let closingDay

  // 締日区分によって処理を分岐
  if (closingCode === '99') {
    // 末日の場合
    closingDay = new Date(year, month, 0).getDate() // 次月の0日を指定してその月の末日を取得
  } else {
    // 締日区分が特定の日付の場合
    closingDay = parseInt(closingCode, 10)
  }

  // 締日が指定された日より前か後かをチェックして、締日を返す
  const closingDate = new Date(year, month - 1, closingDay)
  if (closingDate < date) {
    // 締日が指定日より前なら翌月の締日を計算
    closingDate.setMonth(closingDate.getMonth() + 1)
  }

  // YYYY-MM-DD形式で締日を返す
  const result = `${closingDate.getFullYear()}-${String(
    closingDate.getMonth() + 1
  ).padStart(2, '0')}-${String(closingDate.getDate()).padStart(2, '0')}`
  return result
}

/**
 * 指定された文字列が 'YYYY-MM-DD' 形式であり、かつ有効な日付かどうかを判定する関数。
 *
 * @param {string} dateString - 判定対象の日付文字列。
 * @returns {boolean} - 'YYYY-MM-DD'形式であり、実在する日付なら true、そうでなければ false を返す。
 */
export function isValidDateFormat(dateString) {
  // YYYY-MM-DD形式の正規表現パターン
  const regex = /^\d{4}-\d{2}-\d{2}$/

  // 文字列が 'YYYY-MM-DD' 形式に一致しない場合は false を返す
  if (!regex.test(dateString)) {
    return false
  }

  // 有効な日付かどうかを確認
  const date = new Date(dateString)

  // 日付の妥当性を確認
  const isValidDate =
    !isNaN(date.getTime()) && dateString === date.toISOString().slice(0, 10)

  return isValidDate
}
