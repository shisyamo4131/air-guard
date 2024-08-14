/**
 * ### TransportationCostApplication.js
 *
 * 概要:
 * TransportationCostApplicationクラスは、従業員情報を管理するためのモデルクラスです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-08-12 - 初版作成
 */

export const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    operationResults: { type: Array, default: () => [], required: false },
    total: { type: Number, default: null, required: false },
    status: {
      type: String,
      default: '0:creating',
      validator: (v) =>
        [
          '0:creating',
          '1:draft',
          '2:pending',
          '3:approved',
          '4:settled',
          '8:rejected',
          '9:expired',
        ].includes(v),
      required: false,
    },
    createAt: { type: Number, default: null, required: false },
    draftAt: { type: Number, default: null, required: false },
    pendingAt: { type: Number, default: null, required: false },
    approvedAt: { type: Number, default: null, required: false },
    rejectedAt: { type: Number, default: null, required: false },
    settledAt: { type: Number, default: null, required: false },
    expiredAt: { type: Number, default: null, required: false },
  },
}

export default class TransportationCostApplication {
  constructor(item = {}) {
    this.initialize(item)
  }

  /**
   * 初期化メソッド
   * @param {object} item - 初期化するアイテムオブジェクト
   */
  initialize(item = {}) {
    // デフォルト値を設定
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    if (!item) return
    Object.keys(item).forEach((key) => {
      if (key in this) {
        this[key] = JSON.parse(JSON.stringify(item[key]))
      }
    })
  }
}
