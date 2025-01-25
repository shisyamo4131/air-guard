/**
 * 従業員稼働実績明細データモデル
 * @author shisyamo4131
 * @refact 2025-01-24
 */
import { accessor, classProps } from './propsDefinition/OperationResultWorker'
export default class OperationResultWorker {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /****************************************************************************
   * INITIALIZE
   ****************************************************************************/
  initialize(item = {}) {
    // classProps に定義されたプロパティを自身のインスタンスに設定
    Object.keys(classProps).forEach((key) => {
      const propDefault = classProps[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault

      // item が key を持っているようであれば値をプロパティにセット
      if (key in item) this[key] = item[key]
    })

    // Accessor を利用した自動計算プロパティへの変換
    Object.defineProperties(this, accessor)
  }

  /****************************************************************************
   * クラスのプロパティをプレーンなオブジェクトとして返します。
   * @returns {Object} - クラスのプロパティを含むオブジェクト
   ****************************************************************************/
  toObject() {
    return { ...this }
  }
}
