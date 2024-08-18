const { getFirestore } = require('firebase-admin/firestore')

/**
 * ## FireModelV2
 *
 * Firestoreのドキュメントモデルとして使用される基本クラス。
 * このクラスは、共通のフィールドやメソッド（`toObject`、`firestoreConverter` など）を提供し、
 * ドキュメントの作成、更新、削除、および読み込みを管理します。
 *
 * @property {string} collectionPath - このクラスのインスタンスが属するFirestoreコレクションまたはサブコレクションのパス
 * @property {Object} tokenMap - N-gram方式で生成されたトークンマップ（マスタデータ用）
 *
 * @method toObject - クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
 * @method firestoreConverter - Firestoreとのデータ変換用コンバータを提供します。
 * @method create - Firestoreに新しいドキュメントを作成します。
 * @method update - Firestoreで既存のドキュメントを更新します。
 * @method delete - Firestoreでドキュメントを削除します。
 * @method fetch - Firestoreからドキュメントを読み込みます。
 *
 * @example
 * const instance = new FireModelV2({ docId: '123' }, 'OperationWorkResults');
 * await instance.create();
 * await instance.update();
 * const data = await instance.fetch();
 * await instance.delete();
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
class FireModelV2 {
  // プライベートフィールド
  #createAt = null
  #createDate = null
  #updateAt = null
  #updateDate = null
  #uid = null
  #tokenFields = []

  /**
   * コンストラクタ
   * @param {Object} data - 初期データを含むオブジェクト
   * @param {string} collectionPath - Firestoreコレクションまたはサブコレクションのパス
   */
  constructor(data = {}, collectionPath = '') {
    this.collectionPath = collectionPath
    this.docId = data?.docId || ''
    this.#createAt = data?.createAt || null
    this.#createDate = data?.createDate || null
    this.#updateAt = data?.updateAt || null
    this.#updateDate = data?.updateDate || null
    this.#uid = data?.uid || null
    Object.defineProperties(this, {
      tokenMap: {
        enumerable: true,
        get: this.#generateTokenMap.bind(this),
        set: this.#setTokenMap.bind(this),
      },
    })
  }

  get tokenFields() {
    return this.#tokenFields
  }

  set tokenFields(v) {
    this.#tokenFields = v
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

  /**
   * クラスのインスタンスを通常のJavaScriptオブジェクトに変換します。
   * プライベートフィールドも含めて出力されるようにします。
   * @returns {Object} - 変換されたオブジェクト
   */
  toObject() {
    return {
      docId: this.docId,
      createAt: this.#createAt,
      createDate: this.#createDate,
      updateAt: this.#updateAt,
      updateDate: this.#updateDate,
      uid: this.#uid,
      ...this,
    }
  }

  /**
   * Firestoreとのデータ変換用コンバータを提供します。
   * @returns {Object} - Firestoreのコンバータ
   */
  firestoreConverter() {
    return {
      toFirestore: (instance) => instance.toObject(),
      fromFirestore: (snapshot) => {
        const data = snapshot.data()
        return new this.constructor(data, this.collectionPath)
      },
    }
  }

  /**
   * Firestoreに新しいドキュメントを作成します。
   * @param {string} docId - ドキュメントのIDです。指定しない場合は自動生成されます。
   * @returns {Promise<void>} - 作成処理の完了を待つPromise
   */
  async create(docId = null) {
    this.#createAt = this.dateUtc().getTime()
    this.#createDate = this.dateJst().toLocaleString()
    this.#updateAt = this.#createAt
    this.#updateDate = this.#createDate
    this.#uid = 'cloud-function'

    const colRef = getFirestore().collection(this.collectionPath)
    const docRef = docId ? colRef.doc(docId) : colRef.doc()
    this.docId = docRef.id
    await docRef.withConverter(this.firestoreConverter()).set(this)
  }

  /**
   * Firestoreで既存のドキュメントを更新します。
   * @returns {Promise<void>} - 更新処理の完了を待つPromise
   */
  async update() {
    this.#updateAt = this.dateUtc().getTime()
    this.#updateDate = this.dateJst().toLocaleString()
    this.#uid = 'cloud-function'

    const colRef = getFirestore().collection(this.collectionPath)
    const docRef = colRef.doc(this.docId).withConverter(this.firestoreConverter)
    await docRef.update(this)
  }

  /**
   * Firestoreでドキュメントを削除します。
   * @returns {Promise<void>} - 削除処理の完了を待つPromise
   */
  async delete() {
    const colRef = getFirestore().collection(this.collectionPath)
    const docRef = colRef.doc(this.docId)
    await docRef.delete()
  }

  /**
   * Firestoreからドキュメントを読み込みます。
   * @returns {Promise<FireModelV2|null>} - 読み込まれたデータを含むクラスのインスタンス、またはnull
   */
  async fetch() {
    const colRef = getFirestore().collection(this.collectionPath)
    const docRef = colRef
      .doc(this.docId)
      .withConverter(this.firestoreConverter())
    const docSnapshot = await docRef.get()
    return docSnapshot.exists ? docSnapshot.data() : null
  }

  /**
   * UTCタイムゾーンののDateオブジェクトを返します。
   * @returns {Date} UTCタイムゾーンのDateオブジェクト
   */
  dateUtc() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + offset * 60 * 1000)
  }

  /**
   * JSTタイムゾーンのDateオブジェクトを返します。
   * @returns {Date} JSTタイムゾーンのDateオブジェクト
   */
  dateJst() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + (offset + 9 * 60) * 60 * 1000)
  }
}

module.exports = FireModelV2
