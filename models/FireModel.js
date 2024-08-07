/**
 * FireModel.js
 *
 * 概要:
 * FireModelクラスは、Firestoreを使用したCRUD操作を簡素化するための基底クラスです。
 * このクラスを継承することで、各種モデルに対して共通のデータ操作ロジックを提供します。
 * また、リアルタイムリスニングや自動ナンバリング機能も備えています。
 *
 * 主な機能:
 * - ドキュメントの作成、更新、削除、読み込み
 * - hasManyプロパティによる関連データの削除制御
 * - トークンフィールドによる疑似全文検索
 * - Firestoreトランザクションによる自動ナンバリング
 * - Firestoreのリアルタイムリスニング
 * - ドキュメントへのタイムスタンプの自動追加
 *
 * 使用例:
 * ---------------------------------------------------------------
 * export default class Customer extends FireModel {
 *   constructor(firestore, auth, item) {
 *     super({ firestore, auth }, item);
 *     this.collection = 'customers';
 *     this.tokenFields = ['name', 'email'];
 *     this.hasMany = [{ collection: 'sites', field: 'customerId', condition: '==', type: 'collection' }];
 *     this.name = item.name || null;
 *     this.email = item.email || null;
 *   }
 * }
 *
 * import { firestore, auth } from '@/plugins/firebase';
 * import Customer from '@/models/Customer';
 *
 * const customer = new Customer(firestore, auth, { name: 'Sample', email: 'sample@example.com' });
 * customer.create().then(docRef => {
 *   console.log('Document created with ID: ', docRef.id);
 * });
 * ---------------------------------------------------------------
 *
 * 自動採番機能の使用方法:
 * 1. `Autonumbers`コレクションに、自動採番対象のコレクション名をIDとしたドキュメントを作成します。
 *
 * 注意事項:
 * - `Autonumbers`コレクションドキュメントには`current`, `length`, `field`, `status`が必要です。
 * - `current`: 現在の番号。
 * - `length`: 番号の桁数。
 * - `field`: 採番されるフィールド名。
 * - `status`: 採番の有効/無効を示すブール値。
 * - 番号が最大値に達すると、新しいドキュメントを作成できません。
 *
 * タイムスタンプの自動追加:
 * #addTimestampsをtrueにすると、追加・更新されるドキュメントにタイムスタンプが追加されます。
 *
 * @author shisyamo4131
 * @version 2.0.0
 *
 * 更新履歴:
 * version 2.0.0 - 2024-07-09 - [破壊的] create()の引数をオブジェクトに変更し、自動採番の適用を選択できるように修正。
 *                            - create()でdocIdが指定されていた場合に、正しくコンソールが出力されていないかったのを修正。
 *
 * 2024-02-27 - トークンマップ生成ロジックの改善
 * 2024-06-17 - subscribeメソッドのcollectionGroup対応
 * 2024-06-20 - メッセージ定数とヘルパー関数の追加
 * 2024-06-24 - タイムスタンプを既定で付与するのではなく、#addTimestampsプロパティによって切り替えられるように変更
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
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
  setDoc,
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
      'update()にはdocIdプロパティが必要です。まずfetch()を呼び出してください。',
    DELETE_REQUIRES_DOCID:
      'delete()にはdocIdプロパティが必要です。まずfetch()を呼び出してください。',
    COULD_NOT_DELETE_CHILD_EXIST:
      '関連するドキュメントが%sコレクションに存在するために削除できません。',
    FETCH_CALLED_NO_DOCID:
      'fetch()が呼び出されましたがドキュメントIDが指定されていません。',
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
    FETCH_CALLED:
      '%sコレクションに対してfetch()が呼び出されました。ドキュメントIDは%sです。',
    FETCH_NO_DOCUMENT:
      'ドキュメントID: %s に該当するドキュメントが存在しませんでした。',
    FETCH_SUCCESS:
      'ドキュメントの読み込みに成功し、取得したデータをモデルにセットしました。',
    FETCH_DOC_CALLED:
      '%sコレクションに対してfetchDoc()が呼び出されました。ドキュメントIDは%sです。',
    FETCH_DOC_NO_DOCUMENT:
      'ドキュメントID: %s に該当するドキュメントが存在しませんでした。',
    FETCH_DOC_SUCCESS: 'ドキュメントの取得に成功しました。',
    FETCH_DOCS_CALLED: '%sコレクションに対してfetchDocs()が呼び出されました。',
    FETCH_DOCS_SUCCESS: '%s件のドキュメントを正常に取得しました。',
    SUBSCRIBE_CALLED: '%sコレクションへのsubscription()が呼び出されました。',
    SUBSCRIBE_GROUP_CALLED:
      '%sコレクションへのsubscriptionGroup()が呼び出されました。',
    SUBSCRIBE_DOC_CALLED:
      '%sコレクションドキュメントへのsubscriptionDoc()が呼び出されました。ドキュメントIDは%sです。',
    UNSUBSCRIBE_CALLED: 'unsubscribe()が呼び出されました。',
    UNSUBSCRIBE_SUCCESS: 'リアルタイムリスナーが正常に解除されました。',
  }

  #firestore
  #collection
  #auth
  #addTimestamps = true // trueにするとドキュメントにタイムスタンプを記録します。
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

  /**
   * Sets timestamps and UID for the document.
   */
  #setTimestampsAndUID() {
    this.createAt = this.dateUtc.getTime()
    this.createDate = this.dateJst.toLocaleString()
    this.updateAt = this.dateUtc.getTime()
    this.updateDate = this.dateJst.toLocaleString()
    this.uid = this.#auth?.currentUser?.uid || 'unknown'
  }

  /**
   * Handles the autonumber logic during a transaction.
   * @param {object} transaction - Firestore transaction
   * @param {object} item - Document data
   */
  async #handleAutonum(transaction, item) {
    const autonumRef = doc(this.#firestore, `Autonumbers/${this.collection}`)
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
   * @param {string} docId - 追加するドキュメントのID。指定しない場合、自動生成されます。
   * @param {boolean} useAutonum - falseにすると自動採番を行いません。規定値はtrueです。
   * @returns 追加されたドキュメントの参照を解決するプロミス
   */
  async create({ docId = undefined, useAutonum = true } = {}) {
    if (docId) {
      console.log(FireModel.getConsoleMessage('CREATE_CALLED', docId))
    } else {
      console.log(FireModel.getConsoleMessage('CREATE_CALLED_NO_DOCID'))
    }
    try {
      const colRef = collection(this.#firestore, this.collection)
      const docRef = docId ? doc(colRef, docId) : doc(colRef)
      this.docId = docRef.id
      if (this.#addTimestamps) this.#setTimestampsAndUID()
      await this.beforeCreate()
      const { ...item } = this
      if (useAutonum) {
        await runTransaction(this.#firestore, async (transaction) => {
          await this.#handleAutonum(transaction, item)
          transaction.set(docRef, item)
        })
      } else {
        await setDoc(docRef, item)
      }
      await this.afterCreate()
      console.info(
        FireModel.getConsoleMessage(
          'CREATE_DOC_SUCCESS',
          this.collection,
          docRef.id
        )
      )
      return docRef
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 指定されたドキュメントIDに該当するドキュメントを取得して、
   * モデルのプロパティに該当するデータをセットします。
   * @param {string} docId - 取得するドキュメントのID
   * @returns
   */
  async fetch(docId = undefined) {
    if (!docId) {
      throw new Error(FireModel.getErrorMessage('FETCH_CALLED_NO_DOCID'))
    }
    console.info(
      FireModel.getConsoleMessage('FETCH_CALLED', this.collection, docId)
    )
    try {
      const docSnap = await this.#getDocumentSnapshot(docId)
      if (!docSnap.exists()) {
        console.warn(FireModel.getConsoleMessage('FETCH_NO_DOCUMENT', docId))
        return
      }
      this.initialize(docSnap.data())
      console.info(FireModel.getConsoleMessage('FETCH_SUCCESS'))
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * 指定されたドキュメントIDに該当するドキュメントを取得して返します。
   * @param {string} docId - 取得するドキュメントのID
   * @returns
   */
  async fetchDoc(docId = undefined) {
    if (!docId) {
      throw new Error(FireModel.getErrorMessage('FETCH_DOC_CALLED_NO_DOCID'))
    }
    console.info(
      FireModel.getConsoleMessage('FETCH_DOC_CALLED', this.collection, docId)
    )
    try {
      const docSnap = await this.#getDocumentSnapshot(docId)
      if (!docSnap.exists()) {
        console.warn(
          FireModel.getConsoleMessage('FETCH_DOC_NO_DOCUMENT', docId)
        )
        return
      }
      console.info(FireModel.getConsoleMessage('FETCH_DOC_SUCCESS'))
      return docSnap.data()
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * Retrieves a document snapshot from Firestore.
   * @param {string} docId - Document ID
   * @returns {object} Document snapshot
   */
  async #getDocumentSnapshot(docId) {
    const colRef = collection(this.#firestore, this.collection)
    const docRef = doc(colRef, docId)
    return await getDoc(docRef)
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
      const docRef = this.#getDocumentReference()
      if (this.#addTimestamps) this.#setTimestampsAndUID()
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
   * Retrieves the document reference for the current document.
   * @returns {object} Document reference
   */
  #getDocumentReference() {
    const colRef = collection(this.#firestore, this.collection)
    return doc(colRef, this.docId)
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
      const docRef = this.#getDocumentReference()
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
   * Checks if the current document has child documents based on the hasMany property.
   * @returns {object|boolean} Child item if exists, otherwise false
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
      console.info(
        FireModel.getConsoleMessage('FETCH_DOCS_SUCCESS', snapshot.docs.length)
      )
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
      const q = this.#createQuery(ngram, constraints)
      this.#listener = onSnapshot(q, async (snapshot) => {
        await this.#handleDocChanges(snapshot, convert)
      })
      return this.#items
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * Creates a Firestore query based on the provided ngram and constraints.
   * @param {string} ngram - Ngram string
   * @param {array} constraints - Query constraints
   * @returns {object} Firestore query
   */
  #createQuery(ngram, constraints) {
    const grams = this.convertToGrams(ngram)
    const wheres = grams.map((gram) => where(`tokenMap.${gram}`, '==', true))
    const colRef = collection(this.#firestore, this.collection)
    return query(colRef, ...constraints, ...wheres)
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
      const q = this.#createGroupQuery(collectionId, ngram, constraints)
      this.#listener = onSnapshot(q, async (snapshot) => {
        await this.#handleDocChanges(snapshot, convert)
      })
      return this.#items
    } catch (err) {
      console.error(err.message)
      throw err
    }
  }

  /**
   * Handles document changes from a Firestore snapshot.
   * @param {object} snapshot - Firestore snapshot
   * @param {function} convert - Function to convert document data
   */
  async #handleDocChanges(snapshot, convert) {
    for (const change of snapshot.docChanges()) {
      const item = convert
        ? await convert(change.doc.data())
        : change.doc.data()
      item.docId = change.doc.id
      const index = this.#items.findIndex(({ docId }) => docId === item.docId)
      if (change.type === 'added') this.#items.push(item)
      if (change.type === 'modified') this.#items.splice(index, 1, item)
      if (change.type === 'removed') this.#items.splice(index, 1)
    }
  }

  /**
   * Creates a Firestore collection group query based on the provided ngram and constraints.
   * @param {string} collectionId - Collection ID
   * @param {string} ngram - Ngram string
   * @param {array} constraints - Query constraints
   * @returns {object} Firestore query
   */
  #createGroupQuery(collectionId, ngram, constraints) {
    const grams = this.convertToGrams(ngram)
    const wheres = grams.map((gram) => where(`tokenMap.${gram}`, '==', true))
    const colRef = collectionGroup(this.#firestore, collectionId)
    return query(colRef, ...constraints, ...wheres)
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
    console.info(
      FireModel.getConsoleMessage(
        'SUBSCRIBE_DOC_CALLED',
        this.collection,
        docId
      )
    )
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
    if (this.#listener) {
      console.info(FireModel.getConsoleMessage('UNSUBSCRIBE_CALLED'))
      this.#listener()
      console.info(FireModel.getConsoleMessage('UNSUBSCRIBE_SUCCESS'))
    }
    this.#listener = null
    this.#items.splice(0)
  }

  /**
   * Retrieves an array of divided string from query text.
   * Returns an empty array if the query text is null, undefined or not a string.
   * @param {string} val - Query text
   * @returns {array} An array of divided string from query text
   */
  convertToGrams(val) {
    // Return empty array if query text is null or undefined.
    if (!val) return []
    // Return empty array if the 'search' is not string.
    if (typeof val !== 'string') return []
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
    return [...new Set(divided)]
  }
}
