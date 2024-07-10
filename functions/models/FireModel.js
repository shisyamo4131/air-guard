/**
 * ### FireModel(cloud functoins)
 *
 * #### OUTLINE:
 * Cloud FunctionsからFirestoreドキュメントを扱うためのデータモデルです。
 * コレクションごとにこのデータモデルを継承して使用します。
 * Cloud FunctionsからFirestoreドキュメントを作成・更新する際、アプリ側のデータモデルの
 * 仕様と合わせて個別にコーディングすることは困難です。
 * データモデルを用意することで維持・メンテナンス性を向上させます。
 *
 * #### CAUTION:
 * - アプリ側のFireModelとは仕様が異なる部分があります。
 * - 作成日時や更新日時などは基本的にアプリ側の正とするべきなので、addTimestampsはfalseが規定値です。
 * ‐ Cloud Functions側で正規の更新処理を行う場合はaddTimestampsをtrueにします。
 *   -> timestampに設定する値を取得する手段を用意していないので、後で実装することになるか？
 *   -> uidはCloud Functionsから取得する手段がないため、timestamp自体が不要のはず・・・
 *
 * #### UPDATE:
 * - version 1.0.0 - 2024-07-10 - 初版作成
 *
 * @author shisyamo4131
 * @version 1.0.0
 */
class FireModel {
  #addTimestamps = false // trueにするとドキュメントにタイムスタンプを記録します。
  #tokenFields = []

  constructor(item, { addTimestamps = false } = {}) {
    this.#addTimestamps = addTimestamps
    this.initialize(item)
    Object.defineProperties(this, {
      tokenMap: {
        enumerable: true,
        get: this.#generateTokenMap.bind(this),
        set: this.#setTokenMap.bind(this),
      },
    })
  }

  /**
   * Generates a token map based on tokenFields.
   * @returns {object} token map
   */
  #generateTokenMap() {
    if (!this.#tokenFields.length) return null
    const arr = []
    this.#tokenFields.forEach((fieldName) => {
      if (fieldName in this && this[fieldName]) {
        const target = this[fieldName].replace(
          /[\uD800-\uDBFF]|[\uDC00-\uDFFF]|~|\*|\[|\]|\s+/g,
          ''
        )
        for (let i = 0; i < target.length; i++) {
          arr.push([target.substring(i, i + 1), true])
        }
        for (let i = 0; i < target.length - 1; i++) {
          arr.push([target.substring(i, i + 2), true])
        }
      }
    })
    return Object.fromEntries(arr)
  }

  /**
   * Sets the tokenMap property.
   * @param {object} value - The value to set for tokenMap
   */
  #setTokenMap(value) {
    // No-op setter to avoid errors during initialization.
    // This can be customized if needed to handle specific logic.
  }

  get tokenFields() {
    return this.#tokenFields
  }

  set tokenFields(v) {
    this.#tokenFields = v
  }

  /**
   * データモデルを初期化するためのメソッドです。
   * コンストラクタから呼び出されるほか、独自に呼び出すことで
   * データモデルを初期化することができます。
   * @param {object} item
   * @returns
   */
  initialize(item = {}) {
    this.docId = ''
    if (this.#addTimestamps) {
      this.createAt = null
      this.createDate = null
      this.updateAt = null
      this.updateDate = null
      this.uid = null
    }
    if (!item) return
    Object.keys(item).forEach((key) => {
      if (key in this) {
        this[key] = JSON.parse(JSON.stringify(item[key]))
      }
    })
  }
}

module.exports = FireModel
