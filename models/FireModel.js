/**
 * FireModel.js
 * @author shisyamo4131
 * @update 2024-06-20   各種メッセージを定数にし、メッセージヘルパー関数を用意。
 *                      メッセージの出力にヘルパーを使うよう統一。
 */

/* eslint-disable */

import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore'

export default class FireModel {
  // メッセージ定数
  static ERROR_MESSAGES = {
    HAS_MANY_NOT_ARRAY:
      '%sコレクションのコンストラクタでエラーが発生しました。hasManyプロパティは配列である必要があります。',
    HAS_MANY_INVALID:
      '%sコレクションのコンストラクタでエラーが発生しました。hasManyプロパティが正しく設定されていません。collection, field, condition, typeが必要です。',
    HAS_MANY_CONDITION_INVALID:
      "%sコレクションのコンストラクタでエラーが発生しました。hasManyプロパティが正しく設定されていません。conditionプロパティの値は'=='または'array-contains'のみ可能です。",
    NO_MORE_DOCUMENT: 'これ以上%sコレクションにドキュメントを追加できません。',
    UPDATE_REQUIRES_DOCID:
      'update()にはdocIdプロパティが必要です。まずfetchDoc()を呼び出してください。',
    DELETE_REQUIRES_DOCID:
      'delete()にはdocIdプロパティが必要です。まずfetch()を呼び出してください。',
    COULD_NOT_DELETE_CHILD_EXIST:
      '関連するドキュメントが%sコレクションに存在するために削除できません。',
    FETCH_DOC_CALLED_NO_DOCID:
      'fetchDoc()が呼び出されましたがドキュメントIDが指定されていません。',
    SUBSCRIBE_DOC_CALLED_NO_DOCID:
      'subscribeDoc()が呼び出されましたがドキュメントIDが指定されていません。',
  }

  static CONSOLE_MESSAGES = {
    CREATE_CALLED: 'create()が呼び出されました。ドキュメントIDは%sです。',
    CREATE_CALLED_NO_DOCID:
      'create()が呼び出されました。ドキュメントIDは指定されていません。',
    CREATE_DOC_SUCCESS:
      '%sコレクションにドキュメントが正常に作成されました。ドキュメントIDは%sです。',
    UPDATE_CALLED: 'update()が呼び出されました。ドキュメントIDは%sです。',
    UPDATE_DOC_SUCCESS:
      '%sコレクションにドキュメントが正常に更新されました。ドキュメントIDは%sです。',
    DELETE_CALLED: 'delete()が呼び出されました。ドキュメントIDは%sです。',
    DELETE_DOC_SUCCESS:
      '%sコレクションからドキュメントが正常に削除されました。ドキュメントIDは%sです。',
    FETCH_DOC_CALLED: 'fetchDoc()が呼び出されました。ドキュメントIDは%sです。',
    FETCH_DOC_NO_DOCUMENT:
      'ドキュメントID: %s に該当するドキュメントが存在しませんでした。',
    FETCH_DOC_SUCCESS:
      'ドキュメントの読み込みに成功し、取得したデータをモデルにセットしました。',
    FETCH_DOCS_CALLED: '%sコレクションに対してfetchDocs()が呼び出されました。',
    SUBSCRIBE_CALLED: '%sコレクションへのsubscription()が呼び出されました。',
    SUBSCRIBE_GROUP_CALLED:
      '%sコレクションへのsubscriptionGroup()が呼び出されました。',
    SUBSCRIBE_DOC_CALLED:
      '%sコレクションドキュメントへのsubscriptionDoc()が呼び出されました。ドキュメントIDは%sです。',
    UNSUBSCRIBE_CALLED: 'unsubscribe()が呼び出されました。',
    UNSUBSCRIBE_SUCCESS: 'リアルタイムリスナーが正常に解除されました。',
    UNSUBSCRIBE_NO_LISTENER:
      '解除するリアルタイムリスナーが存在しませんでした。',
  }

  #firestore
  #collection
  #auth
  #hasMany = []
  #tokenFields = []
  #listener = null // A listener for subscription.
  #items = [] // An array of fetched documents data by subscription.

  /**
   * コンストラクタ
   * @param {object} firestore - Firestoreインスタンス
   * @param {object} auth - Authenticationインスタンス
   * @param {object} item - インスタンスと同時にクラスプロパティに渡す値
   */
  constructor({ firestore, auth }, item) {
    this.#firestore = firestore
    this.#auth = auth
    this.initialize(item)
    Object.defineProperties(this, {
      tokenMap: {
        enumerable: true,
        get() {
          if (!this.#tokenFields.length) return null
          const arr = []
          this.#tokenFields.forEach((fieldName) => {
            if (fieldName in this && !!this[fieldName]) {
              /* 2024-02-27 サロゲートペア文字と一部の記号を排除するように修正 */
              // const target = this[fieldName].replace(/\s+/g, '')
              const target = this[fieldName].replace(
                /[\uD800-\uDBFF]|[\uDC00-\uDFFF]|~|\*|\[|\]|\s+/g,
                ''
              )
              for (let i = 0; i <= target.length - 1; i++) {
                arr.push([target.substring(i, i + 1), true])
              }
              for (let i = 0; i <= target.length - 2; i++) {
                arr.push([target.substring(i, i + 2), true])
              }
            }
          })
          const result = Object.fromEntries(arr)
          return result
        },
        set(v) {},
      },
    })
  }

  static getErrorMessage(key, ...params) {
    return FireModel.formatMessage(FireModel.ERROR_MESSAGES[key], ...params)
  }

  static getConsoleMessage(key, ...params) {
    return FireModel.formatMessage(FireModel.CONSOLE_MESSAGES[key], ...params)
  }

  static formatMessage(template, ...params) {
    return `[FireModel.js] ${template.replace(/%s/g, () => params.shift())}`
  }

  get collection() {
    return this.#collection
  }

  set collection(v) {
    this.#collection = v
  }

  get hasMany() {
    return this.#hasMany
  }

  set hasMany(v) {
    if (!Array.isArray(v)) {
      throw new TypeError(
        FireModel.getErrorMessage('HAS_MANY_NOT_ARRAY', this.collection)
      )
    }
    for (const item of v) {
      const { collection: colName, field, condition, type } = item
      if (!colName || !field || !condition || !type) {
        throw new TypeError(
          FireModel.getErrorMessage('HAS_MANY_INVALID', this.collection)
        )
      }
      if (!['==', 'array-contains'].includes(condition)) {
        throw new TypeError(
          FireModel.getErrorMessage(
            'HAS_MANY_CONDITION_INVALID',
            this.collection
          )
        )
      }
    }
    this.#hasMany = v
  }

  get tokenFields() {
    return this.#tokenFields
  }

  set tokenFields(v) {
    this.#tokenFields = v
  }

  get firestore() {
    return this.#firestore
  }

  get auth() {
    return this.#auth
  }

  /**
   * データモデルを初期化するためのメソッドです。
   * コンストラクタから呼び出されるほか、独自に呼び出すことで
   * データモデルを初期化することができます。
   * @param {object} item
   * @returns
   */
  initialize(item) {
    this.docId = null
    this.createAt = null
    this.createDate = null
    this.updateAt = null
    this.updateDate = null
    this.uid = null
    if (!item) return
    Object.keys(item).forEach((key) => {
      if (key in this) {
        this[key] = JSON.parse(JSON.stringify(item[key]))
      }
    })
  }

  /**
   * ドキュメント作成前に実行されるメソッド
   * @returns Promise
   */
  beforeCreate() {
    return Promise.resolve()
  }

  /**
   * ドキュメント更新前に実行されるメソッド
   * @returns Promise
   */
  beforeUpdate() {
    return Promise.resolve()
  }

  /**
   * ドキュメント削除前に実行されるメソッド
   * @returns Promise
   */
  beforeDelete() {
    return Promise.resolve()
  }

  /**
   * ドキュメント作成後に実行されるメソッド
   * @returns Promise
   */
  afterCreate() {
    return Promise.resolve()
  }

  /**
   * ドキュメント更新後に実行されるメソッド
   * @returns Promise
   */
  afterUpdate() {
    return Promise.resolve()
  }

  /**
   * ドキュメント削除後に実行されるメソッド
   * @returns Promise
   */
  afterDelete() {
    return Promise.resolve()
  }

  /**
   * UTCのDateオブジェクトを返すメソッド
   * @returns UTCのDateオブジェクト
   */
  get dateUtc() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + offset * 60 * 1000)
  }

  /**
   * JSTのDateオブジェクトを返すメソッド
   * @returns JSTのDateオブジェクト
   */
  get dateJst() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + (offset + 9 * 60) * 60 * 1000)
  }

  get items() {
    return this.#items
  }

  /**
   * モデルのプロパティに設定された値でコレクションにドキュメントを追加するメソッド
   * @param {string} docId 追加するドキュメントのID。指定しない場合、自動生成される。
   * @returns 追加されたドキュメントの参照を解決するプロミス
   */
  async create(docId = undefined) {
    console.info(
      FireModel.getConsoleMessage(
        docId ? 'CREATE_CALLED' : 'CREATE_CALLED_NO_DOCID',
        docId
      )
    )
    try {
      const colRef = collection(this.#firestore, this.collection)
      const docRef = docId ? doc(colRef, docId) : doc(colRef)
      this.docId = docRef.id
      this.createAt = this.dateUtc.getTime()
      this.createDate = this.dateJst.toLocaleString()
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      await this.beforeCreate()
      const { ...item } = this
      await runTransaction(this.#firestore, async (transaction) => {
        const autonumRef = doc(
          this.#firestore,
          `Autonumbers/${this.collection}`
        )
        const autonumDoc = await transaction.get(autonumRef)
        if (autonumDoc.exists() && autonumDoc.data().status) {
          const num = autonumDoc.data().current + 1
          const length = autonumDoc.data().length
          const newCode = (Array(length).join('0') + num).slice(-length)
          const maxCode = Array(length + 1).join('0')
          if (newCode === maxCode) {
            throw new Error(
              FireModel.getErrorMessage('NO_MORE_DOCUMENT', this.collection)
            )
          }
          item[autonumDoc.data().field] = newCode
          transaction.update(autonumRef, { current: num })
        }
        transaction.set(docRef, item)
      })
      await this.afterCreate()
      console.info(
        FireModel.getConsoleMessage('CREATE_DOC_SUCCESS', this.collection)
      )
      return docRef
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 指定されたドキュメントIDに該当するドキュメントを取得し、
   * モデルの該当するプロパティに値をセットします。
   * @param {string} docId - 取得するドキュメントのID
   * @returns
   */
  async fetchDoc(docId = undefined) {
    if (!docId) {
      throw new Error(FireModel.getErrorMessage('FETCH_DOC_CALLED_NO_DOCID'))
    }
    console.info(FireModel.getConsoleMessage('FETCH_DOC_CALLED', docId))
    try {
      const colRef = collection(this.#firestore, this.collection)
      const docRef = doc(colRef, docId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        console.warn(
          FireModel.getConsoleMessage('FETCH_DOC_NO_DOCUMENT', docId)
        )
        return
      }
      this.initialize(docSnap.data())
      console.info(FireModel.getConsoleMessage('FETCH_DOC_SUCCESS'))
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 現在プロパティにセットされている値で、ドキュメントを更新します。
   * @returns 更新したドキュメントへの参照
   */
  async update() {
    console.info(FireModel.getConsoleMessage('UPDATE_CALLED', this.docId))
    try {
      if (!this.docId) {
        throw new Error(FireModel.getErrorMessage('UPDATE_REQUIRES_DOCID'))
      }
      const colRef = collection(this.#firestore, this.collection)
      const docRef = doc(colRef, this.docId)
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      await this.beforeUpdate()
      const { createAt, createDate, ...item } = this
      await updateDoc(docRef, item)
      await this.afterUpdate()
      console.info(
        FireModel.getConsoleMessage(
          'UPDATE_DOC_SUCCESS',
          this.collection,
          this.docId
        )
      )
      return docRef
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 現在のドキュメントIDに該当するドキュメントを削除します。
   * @returns
   */
  async delete() {
    console.info(FireModel.getConsoleMessage('DELETE_CALLED', this.docId))
    try {
      if (!this.docId) {
        throw new Error(FireModel.getErrorMessage('DELETE_REQUIRES_DOCID'))
      }
      const hasChild = await this.#hasChild()
      if (hasChild) {
        throw new Error(
          FireModel.getErrorMessage(
            'COULD_NOT_DELETE_CHILD_EXIST',
            hasChild.collection
          )
        )
      }
      const colRef = collection(this.#firestore, this.collection)
      const docRef = doc(colRef, this.docId)
      await this.beforeDelete()
      await deleteDoc(docRef)
      await this.afterDelete()
      console.info(
        FireModel.getConsoleMessage(
          'DELETE_DOC_SUCCESS',
          this.collection,
          this.docId
        )
      )
      return docRef
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * hasManyプロパティに定義されたリレーションにもとづく子ドキュメントが
   * 存在するかどうかを返します。
   * @returns 子ドキュメントが存在すれば対象のhasManyオブジェクトを、存在しなければfalseを返します。
   */
  async #hasChild() {
    for (const item of this.#hasMany) {
      const colRef =
        item.type === 'collection'
          ? collection(this.#firestore, item.collection)
          : collectionGroup(this.#firestore, item.collection)
      const whrObj = where(item.field, item.condition, this.docId)
      const q = query(colRef, whrObj, limit(1))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) return item
    }
    return false
  }

  /**
   * コレクションから複数のドキュメントを取得して配列で返します。
   * convert関数を指定すると、取得したデータを必要な形に変換することが可能です。
   * @param {string} ngram - Ngram検索文字列
   * @param {array} constraints - Firestoreのクエリ条件の配列
   * @param {function} convert - 取得したドキュメントデータを変換するための関数
   * @returns 取得したドキュメントデータの配列
   */
  async fetchDocs(ngram = undefined, constraints = [], convert = undefined) {
    console.info(
      FireModel.getConsoleMessage('FETCH_DOCS_CALLED', this.collection)
    )
    if (ngram) console.table(ngram)
    if (constraints.length) console.table(constraints)
    try {
      const grams = this.convertToGrams(ngram)
      const colRef = collection(this.#firestore, this.collection)
      const wheres = grams.map((gram) => {
        return where(`tokenMap.${gram}`, '==', true)
      })
      const q = query(colRef, ...constraints, ...wheres)
      const snapshot = await getDocs(q)
      if (snapshot.empty) return []
      const result = []
      for (const doc of snapshot.docs) {
        const item = convert ? await convert(doc.data()) : doc.data()
        result.push(item)
      }
      return result
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * コレクションへのリアルタイムリスナーを開始します。
   * 終了するにはunsubscribe()を実行してください。
   * convert関数を指定すると、取得したデータを必要な形に変換することが可能です。
   * @param {string} ngram - 検索文字列
   * @param {array} constraints - クエリーに引き渡す抽出条件の配列
   * @param {function} convert - 取得したドキュメントデータを変換するための関数
   * @returns 取得したドキュメントデータが格納されている配列への参照
   */
  subscribe(ngram = undefined, constraints = [], convert = undefined) {
    this.unsubscribe()
    console.info(
      FireModel.getConsoleMessage('SUBSCRIBE_CALLED', this.collection)
    )
    if (ngram) console.table(ngram)
    if (constraints.length) console.table(constraints)
    try {
      this.#items.splice(0)
      const grams = this.convertToGrams(ngram)
      const wheres = grams.map((gram) => {
        return where(`tokenMap.${gram}`, '==', true)
      })
      const colRef = collection(this.#firestore, this.collection)
      const q = query(colRef, ...constraints, ...wheres)
      this.#listener = onSnapshot(q, async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          const item = convert
            ? await convert(change.doc.data())
            : change.doc.data()
          item.docId = change.doc.id
          const index = this.#items.findIndex(
            ({ docId }) => docId === item.docId
          )
          if (change.type === 'added') this.#items.push(item)
          if (change.type === 'modified') this.#items.splice(index, 1, item)
          if (change.type === 'removed') this.#items.splice(index, 1)
        }
      })
      return this.#items
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * コレクショングループのリアルタイムリスナーを開始します。
   * 終了する場合はunsubscribe()を実行してください。
   * convert関数を指定すると、取得したデータを必要な形に変換することが可能です。
   * @param {string} ngram - 検索文字列
   * @param {array} constraints - クエリーに引き渡す抽出条件の配列
   * @param {function} convert - 取得したドキュメントデータを変換するための関数
   * @returns 取得したドキュメントデータが格納されている配列への参照
   */
  subscribeGroup(ngram = undefined, constraints = [], convert = undefined) {
    this.unsubscribe()
    const collectionId = this.collection.includes('/')
      ? this.collection.substring(this.collection.lastIndexOf('/') + 1)
      : this.collection
    console.info(
      FireModel.getConsoleMessage('SUBSCRIBE_GROUP_CALLED', collectionId)
    )
    if (ngram) console.table(ngram)
    if (constraints.length) console.table(constraints)
    try {
      this.#items.splice(0)
      const grams = this.convertToGrams(ngram)
      const wheres = grams.map((gram) => {
        return where(`tokenMap.${gram}`, '==', true)
      })
      const colRef = collectionGroup(this.#firestore, collectionId)
      const q = query(colRef, ...constraints, ...wheres)
      this.#listener = onSnapshot(q, async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          const item = convert
            ? await convert(change.doc.data())
            : change.doc.data()
          const index = this.#items.findIndex(
            ({ docId }) => docId === item.docId
          )
          if (change.type === 'added') this.#items.push(item)
          if (change.type === 'modified') this.#items.splice(index, 1, item)
          if (change.type === 'removed') this.#items.splice(index, 1)
        }
      })
      return this.#items
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 指定されたIDに該当するドキュメントへのリアルタイムリスナーを開始します。
   * 取得したデータはモデルの該当するプロパティにセットされます。
   * @param {string} docId - リアルタイム参照対象のドキュメントID
   */
  subscribeDoc(docId) {
    if (!docId) {
      throw new Error(
        FireModel.getErrorMessage('SUBSCRIBE_DOC_CALLED_NO_DOCID')
      )
    }
    console.info(FireModel.getConsoleMessage('SUBSCRIBE_DOC_CALLED', docId))
    try {
      this.unsubscribe()
      const docRef = doc(this.#firestore, `${this.collection}/${docId}`)
      this.#listener = onSnapshot(docRef, (doc) => {
        this.initialize(doc.data())
      })
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * Unsubscribe to firestore documents.
   */
  unsubscribe() {
    console.info(FireModel.getConsoleMessage('UNSUBSCRIBE_CALLED'))
    if (this.#listener) {
      this.#listener()
      console.info(FireModel.getConsoleMessage('UNSUBSCRIBE_SUCCESS'))
    } else {
      console.warn(FireModel.getConsoleMessage('UNSUBSCRIBE_NO_LISTENER'))
    }
    this.#listener = null
    this.#items.splice(0)
  }

  /**
   * Returns an array of divided string from query text.
   * Returns empty array if the query text is null, undefined or
   * not string.
   * @param {string} val query text.
   * @returns An array of divided string from query text.
   */
  convertToGrams(val) {
    // Return empty array if query text is null or undefined.
    if (!val) return []
    // Return empty array if the 'search' is not string.
    if (!(typeof val === 'string')) return []
    // Get divided string array from query text.
    const target = val.replace(
      /[\uD800-\uDBFF]|[\uDC00-\uDFFF]|~|\*|\[|\]|\s+/g,
      ''
    )
    const length = target.length === 1 ? 1 : 2
    const divided = Array.from(target).reduce((sum, _, index) => {
      if (index > target.length - length) return sum
      sum.push(target.substring(index, index + length))
      return sum
    }, [])
    // Delete duplicated element.
    const result = [...new Set(divided)]
    return result
  }
}
