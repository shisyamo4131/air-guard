/*****************************************************************************
 * OperationCount クラスで使用される 人工数、残業時間 プロパティ用のクラスです。
 * 通常（normal）、半勤（half）、中止（cancel）の人工数と、
 * 残業時間（overtimeMinutes）プロパティを提供します。
 * また、通常、半勤、中止の合計人工数として total プロパティを提供します。
 *****************************************************************************/
class Amount {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /***************************************************************************
   * INITIALIZE
   ***************************************************************************/
  initialize(item = {}) {
    // 通常人工数
    this.normal = typeof item.normal === 'number' ? item.normal : 0

    // 半勤人工数
    this.half = typeof item.half === 'number' ? item.half : 0

    // 中止人工数
    this.cancel = typeof item.cancel === 'number' ? item.cancel : 0

    // 残業時間
    this.overtimeMinutes =
      typeof item.overtimeMinutes === 'number' ? item.overtimeMinutes : 0

    // 合計人工数
    Object.defineProperties(this, {
      total: {
        configurable: true,
        enumerable: true,
        get() {
          return this.normal + this.half + this.cancel
        },
        set(v) {},
      },
    })
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return { ...this }
  }
}

/*****************************************************************************
 * 稼働実績ドキュメントに使用される稼働数管理のためのクラスです。
 * @author shisyamo4131
 * @refact 2025-01-24
 *****************************************************************************/
export default class OperationCount {
  /***************************************************************************
   * CONSTRUCTOR
   ***************************************************************************/
  constructor(item = {}) {
    this.initialize(item)
  }

  /***************************************************************************
   * INITIALIZE
   ***************************************************************************/
  initialize(item = {}) {
    // 資格なし人工数、残業時間
    this.standard = new Amount(item.standard || {})

    // 資格あり人工数、残業時間
    this.qualified = new Amount(item.qualified || {})

    Object.defineProperties(this, {
      // 合計人工数（資格有無関係なし）
      total: {
        configurable: true,
        enumerable: true,
        get() {
          return this.standard.total + this.qualified.total
        },
        set(v) {},
      },

      // 合計残業時間（資格有無関係なし）
      overtimeMinutes: {
        configurable: true,
        enumerable: true,
        get() {
          return this.standard.overtimeMinutes + this.qualified.overtimeMinutes
        },
        set(v) {},
      },
    })
  }

  /***************************************************************************
   * TO OBJECT
   ***************************************************************************/
  toObject() {
    return {
      ...this,
      standard: this.standard.toObject(),
      qualified: this.qualified.toObject(),
    }
  }
}
