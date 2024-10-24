/**
 * ConsumptionTax クラス
 *
 * 概要:
 * このクラスは、日本の消費税を計算するためのものです。
 * 日付に基づいて適用される税率を取得し、指定された丸め方法と
 * 単位に従って消費税額を計算します。
 *
 * 浮動小数点の丸め誤差を避けるため、計算はスケーリングされた整数を使用して行います。
 *
 * 使用方法:
 * 1. `consumptionTax(dateString, roundingOptions)` ファクトリ関数を使用してインスタンスを生成します。
 *    - `dateString`: 必須。日付を 'YYYY-MM-DD' 形式で指定します。
 *    - `roundingOptions`: 任意。端数処理に関するオプション。
 *      - `rounding`: 端数処理の方法を指定します。
 *         - 'round'（四捨五入, 既定値）
 *         - 'floor'（切り捨て）
 *         - 'ceil'（切り上げ）
 *      - `unit`: 端数処理の単位を整数で指定します。
 *         - 1 なら小数点以下第1位（0.1単位）で処理
 *         - 0 なら整数部分で処理（既定値）
 *         - -1 なら10の位で処理
 *
 * 使用例:
 * ```
 * const tax = consumptionTax('2024-01-01', { rounding: 'round', unit: 0 });
 * console.log(tax.rate); // 10%
 * console.log(tax.calc(1000)); // 四捨五入: 100
 * console.log(tax.calc(1050)); // 四捨五入: 110
 * ```
 *
 * @author shisyamo4131
 */

class ConsumptionTax {
  // コンストラクタで日付と端数処理のオプションを受け取る
  constructor(dateString, roundingOptions = { rounding: 'round', unit: 1 }) {
    this.setDate(dateString)
    this.setRoundingOptions(roundingOptions)
  }

  // 税率の変更履歴（インスタンス間で共有されるプロパティ）
  static taxRates = [
    { date: new Date('2019-10-01'), rate: 0.1 }, // 10% 増税
    { date: new Date('2014-04-01'), rate: 0.08 }, // 8% 増税
    { date: new Date('1997-04-01'), rate: 0.05 }, // 5% 増税
    { date: new Date('1989-04-01'), rate: 0.03 }, // 3% 消費税導入
  ]

  // 税率を取得するgetter
  get rate() {
    const applicableTax = ConsumptionTax.taxRates.find(
      (tax) => this.date >= tax.date
    )
    return applicableTax ? applicableTax.rate : 0.0
  }

  // 日付を設定するメソッド
  setDate(dateString) {
    const date = dateString ? new Date(dateString) : new Date()
    if (isNaN(date)) {
      throw new TypeError(
        '無効な日付形式です。YYYY-MM-DDの形式で入力してください。'
      )
    }
    this.date = date
  }

  // 端数処理のオプションを設定するメソッド
  setRoundingOptions({ rounding, unit }) {
    const validRoundingMethods = ['round', 'floor', 'ceil']

    if (!validRoundingMethods.includes(rounding)) {
      throw new TypeError(
        '無効な端数処理区分です。"round", "floor", "ceil" のいずれかを指定してください。'
      )
    }

    if (typeof unit !== 'number' || !Number.isInteger(unit)) {
      throw new TypeError('端数処理単位は整数である必要があります。')
    }

    this.rounding = rounding
    this.unit = unit
  }

  // 金額に基づいて消費税額を計算するメソッド（浮動小数点誤差を最小限にする）
  calc(amount) {
    // 丸めのための係数を計算（10^(-unit)）
    const factor = Math.pow(10, -this.unit)

    // スケーリングされた数値を使用して浮動小数点誤差を回避
    const scaledAmount = Math.round(amount * factor) // 金額をスケーリング
    const scaledTaxAmount = Math.round(scaledAmount * this.rate) // スケーリングされた税額

    let roundedTaxAmount
    switch (this.rounding) {
      case 'floor':
        roundedTaxAmount = Math.floor(scaledTaxAmount) / factor
        break
      case 'ceil':
        roundedTaxAmount = Math.ceil(scaledTaxAmount) / factor
        break
      case 'round':
      default:
        roundedTaxAmount = Math.round(scaledTaxAmount) / factor
        break
    }

    return roundedTaxAmount
  }
}

// インスタンスを簡単に取得するためのファクトリ関数
function consumptionTax(dateString, roundingOptions) {
  return new ConsumptionTax(dateString, roundingOptions)
}

// デフォルトエクスポート
export default consumptionTax
