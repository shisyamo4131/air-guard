/**
 * 指定された文字列が 'YYYY-MM-DD' 形式であり、かつ有効な日付かどうかを判定する関数。
 *
 * @param {string} dateString - 判定対象の日付文字列。
 * @returns {boolean} - 'YYYY-MM-DD'形式であり、実在する日付なら true、そうでなければ false を返す。
 */
function isValidDateFormat(dateString) {
  // YYYY-MM-DD形式の正規表現パターン
  // ^   : 文字列の先頭
  // \d{4} : 4桁の数字（年）
  // -   : ハイフン
  // \d{2} : 2桁の数字（月）
  // -   : ハイフン
  // \d{2} : 2桁の数字（日）
  // $   : 文字列の末尾
  const regex = /^\d{4}-\d{2}-\d{2}$/

  // 文字列が 'YYYY-MM-DD' 形式に一致しない場合は false を返す
  if (!regex.test(dateString)) {
    return false
  }

  // 一致した場合、さらに有効な日付かどうかを確認
  // ここでは new Date() で日付をパースし、無効な日付なら NaN を返すため、それを利用する
  const date = new Date(dateString)

  // getTime() が NaN でないことを確認し、さらに元の文字列が日付のISO形式の一部と一致することをチェック
  // toISOString() で 'YYYY-MM-DD' 部分が一致しているかどうかを確認することで、
  // 不正な日付（例: '2024-13-01' や '2024-09-31' など）を排除する
  const isValidDate =
    !isNaN(date.getTime()) && dateString === date.toISOString().slice(0, 10)

  // 有効な日付であれば true、無効であれば false を返す
  return isValidDate
}

// 関数をモジュールとしてエクスポート
export { isValidDateFormat }
