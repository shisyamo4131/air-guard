/**
 * FireModel.js
 * (c) 2023 shisyamo4131
 *
 * Base class that provides Create, Read, Update, and Delete functions for Firestore.
 * Create a model that extends this class and use it with Nuxt's Injection.
 *
 * sample
 * ---------------------------------------------------------------
 * export default class MODEL_NAME extends FireModel {
 *   constructor(context) {
 *     super(context.app.$firestore, 'COLLECTION_NAME', context.app.$auth)
 *   }
 * }
 * export default(context, inject) => {
 *   inject('MODEL_NAME', (item) => new MODEL_NAME(context, item))
 * }
 * ---------------------------------------------------------------
 *
 * [note]
 * To access the firebase service, provide 'context' as the first argument.
 *
 * The hasMany field can be defined to be undeletable if there is
 * dependent data with the defined conditions.
 *
 * { collection, field, condition, type }
 * type is 'collection' or 'subcollection'.
 *
 * Firestore query condition expressions can be used for condition.
 *
 * tokenFields specifies the fields held by the class itself.
 * To store vulnerable Firestore queries, a token map is generated with
 * the strings stored in the specified fields.
 *
 * The ability to delete dependent documents will not be implemented.
 * Use Cloud Functions as it must be atomic.
 *
 * The Autonumbers collection allows for automatic numbering.
 * To perform Autonumbers,
 * 1. specify the collection name in the document ID,
 * 2. 'current' as the current value
 * 3. 'length' as the number of digits
 * 4. 'field' as the field to be numbered
 * 5. 'status' as the field to be boolean
 *
 * @update 2024-02-27 tokenMap に使用できないサロゲートペア文字列を排除するように修正。
 */

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
  #firestore
  #collection
  #auth
  #hasMany = []
  #tokenFields = []
  #listener = null // A listener for subscription.
  #items = [] // An array of fetched documents data by subscription.

  /**
   * constructor
   * @param {*} context nuxt-context
   * @param {*} item Objects composed of field values.
   */
  constructor(context, item) {
    this.#auth = context.app.$auth
    this.#firestore = context.app.$firestore
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
        `[FireModel.js] The hasMany property must be an array.`
      )
    }
    for (const item of v) {
      const { collection: colName, field, condition, type } = item
      if (!colName || !field || !condition || !type) {
        // eslint-disable-next-line
        console.error(item)
        throw new Error(
          `[FireModel.js] The hasMany property is incorrectly set. It requires collection, field, condition and type.`
        )
      }
      if (!['==', 'array-contains'].includes(condition)) {
        // eslint-disable-next-line
        console.error(item)
        throw new Error(
          `[FireModel.js] The hasMany property is incorrectly set. The only possible values for the condition property are '==' and 'array-contains'.`
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
   * ドキュメントの作成前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeCreate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの更新前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeUpdate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの削除前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeDelete() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの作成後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterCreate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの更新後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterUpdate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの削除後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterDelete() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * UTCでのDateオブジェクトを返します。
   * @returns A Date object as UTC.
   */
  get dateUtc() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + offset * 60 * 1000)
  }

  /**
   * JSTでのDateオブジェクトを返します。
   * @returns A Date object as JST.
   */
  get dateJst() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + (offset + 9 * 60) * 60 * 1000)
  }

  get items() {
    return this.#items
  }

  /**
   * モデルのプロパティに設定された値をドキュメントとしてコレクション追加します。
   * @param {string} docId 追加するドキュメントのidです。指定しない場合、自動で割り振られます。
   * @returns プロミスで解決されたドキュメントへの参照が返されます。
   */
  async create(docId = undefined) {
    this.sendConsole({
      message: docId
        ? 'create() is called. Document id is %s.'
        : 'create() is called. No document id is specified.',
      params: docId ? [docId] : [],
    })
    try {
      await this.beforeCreate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeCreate() in create().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = docId ? doc(colRef, docId) : doc(colRef)
      this.docId = docRef.id
      this.createAt = this.dateUtc.getTime()
      this.createDate = this.dateJst.toLocaleString()
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      const { ...item } = this
      await runTransaction(this.#firestore, async (transaction) => {
        const autonumRef = doc(
          this.#firestore,
          `Autonumbers/${this.#collection}`
        )
        const autonumDoc = await transaction.get(autonumRef)
        if (autonumDoc.exists() && autonumDoc.data().status) {
          const num = autonumDoc.data().current + 1
          const length = autonumDoc.data().length
          const newCode = (Array(length).join('0') + num).slice(-length)
          const maxCode = Array(length + 1).join('0')
          if (newCode === maxCode) {
            throw new Error(
              `No more documents can be added to the ${
                this.#collection
              } collection.`
            )
          }
          item[autonumDoc.data().field] = newCode
          transaction.update(autonumRef, { current: num })
        }
        transaction.set(docRef, item)
      }).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at setDoc() in create().',
          type: 'error',
        })
        throw err
      })
      await this.afterCreate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterCreate() in create().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully created in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
      return docRef
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * 指定されたドキュメントidに該当するドキュメントをコレクションから取得し、
   * 自身のプロパティに値をセットします。
   * @param {string} docId 取得するドキュメントのidです。
   * @returns
   */
  async fetch(docId = undefined) {
    this.sendConsole({ message: 'fetch() is called.' })
    try {
      if (!docId) throw new Error('fetch() requires docId as argument.')
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, docId)
      const docSnap = await getDoc(docRef).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at getDoc() in fetch().',
          type: 'error',
        })
        throw err
      })
      if (docSnap.exists()) {
        this.sendConsole({
          message:
            'The document corresponding to the specified document id (%s) has been fetched.',
          params: [docId],
        })
        Object.keys(this).forEach((key) => {
          if (key in docSnap.data()) this[key] = docSnap.data()[key]
        })
      } else {
        this.sendConsole({
          message:
            'The document corresponding to the specified document id (%s) does not exist. FireModel properties are initialized.',
          params: [docId],
          type: 'warn',
        })
        this.initialize()
      }
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * モデルのプロパティにセットされた値で、ドキュメントを更新します。
   * 更新対象のドキュメントはdocIdプロパティを参照して特定されます。
   * @returns
   */
  async update() {
    this.sendConsole({ message: 'update() is called.' })
    try {
      if (!this.docId) {
        throw new Error(
          'update() should have docId as a property. Call fetch() first.'
        )
      }
      await this.beforeUpdate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeUpdate() in update().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, this.docId)
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      const { createAt, createDate, ...item } = this
      await updateDoc(docRef, item).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at update().',
          type: 'error',
        })
        throw err
      })
      await this.afterUpdate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterUpdate() in update().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully updated in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
      return docRef
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * モデルのプロパティにセットされた値で、ドキュメントを更新します。
   * 更新対象のドキュメントはdocIdプロパティを参照して特定されます。
   * @returns
   */
  async delete() {
    this.sendConsole({ message: 'delete() is called.' })
    try {
      if (!this.docId) {
        throw new Error(
          'delete() should have docId as a property. Call fetch() first.'
        )
      }
      const hasChild = await this.#hasChild()
      if (hasChild) {
        throw new Error(
          '関連する情報が登録されているため削除できません。\nCollection: ' +
            hasChild.collection +
            '\ndocId: ' +
            this.docId
        )
      }
      await this.beforeDelete().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeDelete() in delete().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, this.docId)
      await deleteDoc(docRef).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at delete().',
          type: 'error',
        })
        throw err
      })
      await this.afterDelete().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterDelete() in delete().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully deleted in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
      return docRef
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * hasManyプロパティに定義されたリレーションにもとづく子ドキュメントが
   * 存在するかどうかを返します。
   * @returns 子ドキュメントが存在すればtrueを、存在しなければfalseを返します。
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
   * Retrieves documents from Firestore whose tokenMap matches the string
   * given as an argument and returns them as an array.
   * @param {string} ngram
   * @param {array} constraints
   * @returns An array of document data retrieved from firestore.
   */
  async fetchDocs(ngram = undefined, constraints = []) {
    const grams = this.convertToGrams(ngram)
    const colRef = collection(this.#firestore, this.#collection)
    const wheres = grams.map((gram) => {
      return where(`tokenMap.${gram}`, '==', true)
    })
    const q = query(colRef, ...constraints, ...wheres)
    const snapshot = await getDocs(q)
    if (snapshot.empty) return []
    return snapshot.docs.map((doc) => doc.data())
  }

  /**
   * Starts a subscription to a document that matches the criteria given
   * in the argument constraints and returns a function to unsubscribe.
   * You can add conditions by tokenMap by giving a string to the argument ngram.
   * @param {string} ngram
   * @param {array} constraints
   * @returns Reference to the array in which the retrieved document data is stored.
   */
  subscribe(ngram = undefined, constraints = []) {
    this.unsubscribe()
    // eslint-disable-next-line
    console.info('Subscription of %s has been started.', this.#collection)
    this.#items.splice(0)
    const grams = this.convertToGrams(ngram)
    const wheres = grams.map((gram) => {
      return where(`tokenMap.${gram}`, '==', true)
    })
    const colRef = collection(this.#firestore, this.#collection)
    const q = query(colRef, ...constraints, ...wheres)
    this.#listener = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const item = change.doc.data()
        const index = this.#items.findIndex(({ docId }) => docId === item.docId)
        if (change.type === 'added') this.#items.push(item)
        if (change.type === 'modified') this.#items.splice(index, 1, item)
        if (change.type === 'removed') this.#items.splice(index, 1)
      })
    })
    return this.#items
  }

  /**
   * Unsubscribe to firestore documents.
   */
  unsubscribe() {
    if (this.#listener) {
      // eslint-disable-next-line
      console.info(
        'Subscription of %s has been unsubscribed.',
        this.#collection
      )

      this.#listener()
    }
    this.#listener = null
    this.#items.splice(0)
  }

  /**
   * コンソールを出力します。
   * @param {message, params, type}
   */
  sendConsole({ message, params = [], type = 'info' }) {
    // eslint-disable-next-line
    console[type](`[FireModel.js] ${message}`, ...params)
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
