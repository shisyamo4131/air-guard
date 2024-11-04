import { getFirestore } from 'firebase-admin/firestore'
import { error, info, warn } from 'firebase-functions/logger'
import { getMessage } from './firestore-messages.js'
const firestore = getFirestore()
/**
 * [FireMode を Cloud Functions 用にカスタマイズしたバージョン]
 */
export default class FireModel {
  // Firestoreのコレクション名です。
  #collectionPath = ''

  // ドキュメントの作成時に自動採番を採用するかどうかを表すフラグです。
  #useAutonumber = false

  // ドキュメントの削除処理を論理的に行うかどうかのフラグです。
  #logicalDelete = false

  // クラスに適用されるべきプロパティの定義です。
  #classProps = {}

  /**
   * ドキュメントに依存するコレクション情報を格納するプロパティです。
   * 各要素は以下の構造を持つオブジェクトです:
   * - collection: 文字列型で、依存するドキュメントが存在するコレクションのパスを指定します。
   * - field: 文字列型で、RDBMSでいうところの外部キーに相当するフィールドを指定します。
   * - condition: 文字列型で、Firestoreのクエリ条件を指定します（例: '==', 'array-contains' など）。
   * - type: 文字列型で、'collection' または 'subcollection' のどちらかを指定します。
   *          'collection' は通常のコレクション、'subcollection' はサブコレクションを意味します。
   */
  #hasMany = []

  // tokenMapに反映させるフィールドのリストです。
  #tokenFields = []

  /**
   * FireModelクラスのインスタンスを初期化します。
   * このクラスはFirestoreコレクションのCRUD操作をサポートし、
   * 依存関係のあるコレクションの管理や論理削除の処理も可能です。
   *
   * @param {Object} item - 初期化するデータモデルのプロパティを含むオブジェクト
   */
  constructor(item = {}) {
    this.#loadCollectionPath()
    this.#loadClassProps()
    this.#loadUseAutonumber()
    this.#loadLogicalDelete()
    this.#loadHasMany()
    this.#loadTokenFields()
    this.initialize(item)
    Object.defineProperties(this, {
      tokenMap: {
        enumerable: true,
        configurable: true,
        get: this.#generateTokenMap.bind(this),
        set: this.#setTokenMap.bind(this),
      },
    })
  }

  /****************************************************************************
   * 引数にはエラー時に出力されるコードサンプルを文字列で受け取ります。
   * 各行のインデントを調整して返します。
   * @returns {string} インデントが調整されたコードサンプル（文字列）
   ****************************************************************************/
  removeIndentation(str) {
    // 最初と最後の余分な改行やスペースを削除
    const trimmedStr = str.trim()

    // 文字列を行ごとに分割
    const lines = ['--', ...trimmedStr.split('\n'), '--']

    // インデントがある行のみを対象に最小のインデント長を計算
    const indentLength = lines
      .filter((line) => line.trim().length > 0 && line.match(/^\s+/)) // 空行とインデントがない行を除外
      .reduce((min, line) => {
        const match = line.match(/^(\s+)/) // 行頭のスペースを取得
        return match ? Math.min(min, match[1].length) : min
      }, Infinity)

    // インデントを削除して再構成
    return lines
      .map((line) => {
        // 空行ならそのまま返す。インデントがある行のみインデントを削除
        return line.trim().length === 0 || !line.match(/^\s+/)
          ? line
          : line.slice(indentLength)
      })
      .join('\n')
  }

  /****************************************************************************
   * サブクラスに定義された `classProps` の値を、自身の `#classProps` にセットします。
   * - `classProps` が未定義の場合は、空のオブジェクトをセットします。
   * - 各プロパティはオブジェクトであり、必須のキーとして `type`、`default`、`required` を持ちます。
   * - `type` は `String`, `Number`, `Boolean`, `Object`, `Array`, `Function` のいずれかである必要があります。
   * - `required` は `Boolean` 型でなければなりません。
   *
   * @throws {Error} - `classProps` の形式が正しくない場合、エラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadClassProps() {
    const sender = `${this.#collectionPath} - loadClassProps`

    // `classProps` が未定義の場合は空のオブジェクトをセット
    if (typeof this.constructor.classProps === 'undefined') {
      this.#classProps = {}
      return // early return for clarity
    }

    // `classProps` がオブジェクトであることを確認
    if (
      typeof this.constructor.classProps !== 'object' ||
      this.constructor.classProps === null
    ) {
      throw new Error(getMessage(sender, 'CLASS_PROPS_MUST_BE_OBJECT'))
    }

    // 各プロパティの検証
    Object.entries(this.constructor.classProps).forEach(([key, value]) => {
      // プロパティがオブジェクトであることを確認
      if (typeof value !== 'object' || value === null) {
        throw new Error(getMessage(sender, 'CLASS_PROP_MUST_BE_OBJECT', key))
      }

      // 必要なキーの確認
      const requiredKeys = ['type', 'default', 'required']
      requiredKeys.forEach((requiredKey) => {
        if (!(requiredKey in value)) {
          throw new Error(
            getMessage(sender, 'CLASS_PROP_REQUIRES_KEY', key, requiredKey)
          )
        }
      })

      // `type` の確認（指定された型のいずれか）
      const validTypes = [String, Number, Boolean, Object, Array, Function]
      if (!validTypes.includes(value.type)) {
        throw new Error(getMessage(sender, 'CLASS_PROP_TYPE_INVALID', key))
      }

      // `required` が Boolean であることを確認
      if (typeof value.required !== 'boolean') {
        throw new TypeError(
          getMessage(sender, 'CLASS_PROP_REQUIRED_INVALID', key)
        )
      }
    })

    // `classProps` を自身のプロパティにセット
    this.#classProps = { ...this.constructor.classProps } // シャローコピーを作成
  }

  /****************************************************************************
   * サブクラスに定義された `collectionPath` の値を、自身の `#collectionPath` に
   * 読み込みます。
   * @throws {Error} サブクラスに `collectionPath` が定義されていない場合、エラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadCollectionPath() {
    const sender = `[FireModel.js] - loadCollectionPath`

    if (typeof this.constructor.collectionPath === 'undefined') {
      const sample = `
        class SubClass extends Firemodel {
          static collectionPath = 'SubClasses';
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          constructor(item) {
            ...
          }
        }
      `
      throw new Error(
        getMessage(sender, 'NO_COLLECTION_PATH', this.removeIndentation(sample))
      )
    }
    this.#collectionPath = this.constructor.collectionPath
  }

  /****************************************************************************
   * サブクラスに定義された `hasMany` プロパティを取得し、自身の `#hasMany` にセットします。
   * - `hasMany` が未定義の場合は `#hasMany` に空の配列をセットします。
   * - `hasMany` が配列であることを確認し、各要素の形式もチェックします。
   * @throws {Error} サブクラスの `hasMany` が配列ではない、または形式が正しくない場合にエラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadHasMany() {
    const sender = `${this.#collectionPath} - loadHasMany`

    // `hasMany` が未定義の場合は空の配列をセット
    if (typeof this.constructor.hasMany === 'undefined') {
      this.#hasMany = []
      return
    }

    // `hasMany` が配列であることを確認
    if (!Array.isArray(this.constructor.hasMany)) {
      throw new TypeError(getMessage(sender, 'HAS_MANY_NOT_ARRAY'))
    }

    // 各要素を検証
    this.constructor.hasMany.forEach((relation, index) => {
      const requiredKeys = ['collection', 'field', 'condition', 'type']
      const validTypes = ['collection', 'subcollection'] // 有効なタイプを定義

      // 各要素がオブジェクトであることを確認
      if (typeof relation !== 'object' || relation === null) {
        throw new Error(
          getMessage(
            sender,
            'HAS_MANY_MUST_BE_OBJECT',
            this.#collectionPath,
            index,
            JSON.stringify(relation)
          )
        )
      }

      // 必須のキーがすべて存在することを確認
      requiredKeys.forEach((key) => {
        if (!(key in relation)) {
          throw new Error(
            getMessage(
              sender,
              'HAS_MANY_REQUIRES_KEY',
              this.#collectionPath,
              index,
              JSON.stringify(relation)
            )
          )
        }
      })

      // 余分なキーが含まれていないことを確認
      Object.keys(relation).forEach((key) => {
        if (!requiredKeys.includes(key)) {
          throw new Error(
            getMessage(
              sender,
              'HAS_MANY_INVALID_KEY',
              this.#collectionPath,
              index,
              JSON.stringify(relation)
            )
          )
        }
      })

      // typeプロパティの値が正しいかを確認
      if (!validTypes.includes(relation.type)) {
        throw new Error(
          getMessage(
            sender,
            'HAS_MANY_INVALID_TYPE',
            this.#collectionPath,
            index,
            JSON.stringify(relation)
          )
        )
      }
    })

    // `hasMany` が定義されていて、配列である場合のみセット
    this.#hasMany = this.constructor.hasMany
  }

  /****************************************************************************
   * サブクラスに定義された `useAutonumber` の値を、自身の `#useAutonumber` に
   * 読み込みます。
   * - サブクラスで `useAutonumber` が定義されていない場合、`#useAutonumber` は false になります。
   * - サブクラスの `useAutonumber` がブール値でない場合、エラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadUseAutonumber() {
    const sender = `${this.#collectionPath} - loadUseAutonumber`

    // サブクラスで useAutonumber が未定義の場合、false を設定
    if (typeof this.constructor.useAutonumber === 'undefined') {
      this.#useAutonumber = false
      return // early return for clarity
    }

    // useAutonumber がブール値でない場合、エラーをスロー
    if (typeof this.constructor.useAutonumber !== 'boolean') {
      throw new TypeError(
        getMessage(
          sender,
          'USE_AUTONUMBER_MUST_BE_BOOLEAN',
          this.#collectionPath,
          this.constructor.useAutonumber
        )
      )
    }

    // useAutonumber がブール値であれば、その値を設定
    this.#useAutonumber = this.constructor.useAutonumber
  }

  /****************************************************************************
   * サブクラスに定義された `logicalDelete` の値を、自身の `#logicalDelete` に
   * 読み込みます。
   * - サブクラスで `logicalDelete` が定義されていない場合、`#logicalDelete` は false になります。
   * - サブクラスの `logicalDelete` がブール値でない場合、エラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadLogicalDelete() {
    const sender = `${this.#collectionPath} - loadLogicalDelete`

    // サブクラスで logicalDelete が未定義の場合、false を設定
    if (typeof this.constructor.logicalDelete === 'undefined') {
      this.#logicalDelete = false
      return // early return for clarity
    }

    // logicalDelete がブール値でない場合、エラーをスロー
    if (typeof this.constructor.logicalDelete !== 'boolean') {
      throw new TypeError(
        getMessage(
          sender,
          'LOGICAL_DELETE_MUST_BE_BOOLEAN',
          this.#collectionPath,
          this.constructor.logicalDelete
        )
      )
    }

    // logicalDelete がブール値であれば、その値を設定
    this.#logicalDelete = this.constructor.logicalDelete
  }

  /****************************************************************************
   * サブクラスに定義された `tokenFields` の値を、自身の `#tokenFields` に
   * 読み込みます。
   * - サブクラスで `tokenFields` が定義されていない場合、`#tokenFields` は空の配列になります。
   * - サブクラスの `tokenFields` が配列でない場合、エラーをスローします。
   * - 各要素が文字列でない場合、エラーをスローします。
   * @returns {void}
   ****************************************************************************/
  #loadTokenFields() {
    const sender = `${this.#collectionPath} - loadTokenFields`

    // `tokenFields` が未定義の場合は空の配列をセット
    if (typeof this.constructor.tokenFields === 'undefined') {
      this.#tokenFields = []
      return // early return for clarity
    }

    // `tokenFields` が配列であることを確認
    if (!Array.isArray(this.constructor.tokenFields)) {
      throw new TypeError(getMessage(sender, 'TOKEN_FIELDS_MUST_BE_ARRAY'))
    }

    // `tokenFields` の各要素が文字列であることを確認
    this.constructor.tokenFields.forEach((field, index) => {
      if (typeof field !== 'string') {
        throw new TypeError(
          getMessage(
            sender,
            'TOKEN_FIELD_MUST_BE_STRING',
            index,
            JSON.stringify(field)
          )
        )
      }
    })

    // `tokenFields` を自身のプロパティにセット
    this.#tokenFields = this.constructor.tokenFields
  }

  /****************************************************************************
   * 当該インスタンスを複製したインスタンスを返します。
   * - vueコンポーネントにおいてインスタンスを親に返す場合など、参照渡しを回避するのに使用します。
   * @returns {this.constructor} - 複製された新しいインスタンス
   ****************************************************************************/
  clone() {
    return new this.constructor(this)
  }

  /****************************************************************************
   * validateProperties
   *
   * `classProps`によって定義されたプロパティについて、インスタンスのプロパティ値の
   * バリデーションを行います。このメソッドは、必須入力およびカスタム
   * バリデーションロジックに従ったチェックを実行します。
   *
   * - `required`がtrueの場合、そのプロパティは必須と見なされます。
   * - プロパティが`undefined`、`null`、または空文字列(`''`)である場合、
   *   必須チェックに失敗し、エラーがスローされます。
   * - `validator`関数が指定されている場合、その関数を使用してプロパティ値の
   *   カスタムバリデーションが行われます。バリデーションに失敗した場合、
   *   エラーがスローされます。
   *
   * @returns {void}
   * @throws {Error} 必須プロパティが未設定であるか、バリデーションに失敗した場合
   ****************************************************************************/
  #validateProperties() {
    const sender = `${this.#collectionPath} - validateProperties`

    Object.keys(this.#classProps).forEach((key) => {
      const propConfig = this.#classProps[key]
      // 必須チェック
      if (
        propConfig.required &&
        (this[key] === undefined || this[key] === null || this[key] === '')
      ) {
        throw new Error(getMessage(sender, 'PROP_VALUE_REQUIRED', key))
      }

      // バリデーションチェック
      if (propConfig.validator && !propConfig.validator(this[key])) {
        throw new Error(
          getMessage(sender, 'PROP_VALUE_INVALID', key, this[key])
        )
      }
    })
  }

  /****************************************************************************
   * tokenMapを生成して返します。
   * - 指定されたフィールドの値からトークンを生成し、トークンマップを作成します。
   * - フィールドが存在しないか、値が空の場合は無視されます。
   * - サロゲートペア、特殊文字、および空白文字を除去してトークンを生成します。
   *
   * @returns {Object|null} 生成されたtokenMapを返します。対象フィールドがない場合はnullを返します。
   ****************************************************************************/
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

  /****************************************************************************
   * tokenMapのセッターです。
   * - 初期化時のエラーを避けるためのNo-op（何もしない）セッターです。
   * - 必要に応じて、特定のロジックを実装するためにカスタマイズできます。
   *
   * @param {Object} value - セットするtokenMapの値
   ****************************************************************************/
  #setTokenMap(value) {
    // No-op setter to avoid errors during initialization.
    // This can be customized if needed to handle specific logic.
  }

  /****************************************************************************
   * データモデルを初期化するためのメソッドです。
   * - コンストラクタから呼び出されるほか、独自に呼び出すことで
   *   データモデルを初期化することができます。
   * - プロパティ `createAt` と `updateAt` は、Dateオブジェクトに変換されます。
   * - 他のプロパティはオブジェクトのディープコピーとして初期化されます。
   *
   * @param {Object} item - 初期化するデータモデルのプロパティを含むオブジェクト
   * @returns {void}
   ****************************************************************************/
  initialize(item = {}) {
    /**
     * classPropsに定義されているプロパティを初期化
     */
    Object.keys(this.#classProps).forEach((key) => {
      const propDefault = this.#classProps[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })

    // itemがnullやundefinedであれば終了
    if (!item) return

    this.docId = item?.docId || ''
    this.uid = item?.uid || ''

    /**
     * createAt、updateAtは型をチェックし、Dateオブジェクトに変換して初期化
     * FirestoreにDateオブジェクトを保存すると、Firestore timestampとして登録されるため、
     * これをtoDate()を使用してDateオブジェクトに変換します。
     */
    if (item?.createAt instanceof Date) {
      this.createAt = item.createAt
    } else if (item?.createAt?.toDate) {
      this.createAt = item.createAt.toDate()
    } else {
      this.createAt = null
    }
    if (item?.updateAt instanceof Date) {
      this.updateAt = item.updateAt
    } else if (item?.updateAt?.toDate) {
      this.updateAt = item.updateAt.toDate()
    } else {
      this.updateAt = null
    }

    /**
     * `item`が保有するすべてのプロパティについて、自身の同一名プロパティに値を複製します。
     * - オブジェクトの参照渡しを避けるためJSON.parse(JSON.stringify(item[key]))を使っていましたが、
     *   プロパティの値がカスタムクラスであった場合に、プレーンなオブジェクトに変換されていまっていました。
     * - サブクラスで`customClassMap`を用意し、プロパティにカスタムクラスが定義されている場合、
     *   当該クラスのインスタンスをセットするようにしました。
     */

    // Object.keys(item).forEach((key) => {
    //   if (key in this && key !== "createAt" && key !== "updateAt") {
    //     this[key] = JSON.parse(JSON.stringify(item[key]));
    //   }
    // });

    // サブクラスで定義されたcustomClassMapを取得
    const customClassMap = this.constructor.customClassMap || {}

    Object.keys(item).forEach((key) => {
      if (key in this && key !== 'createAt' && key !== 'updateAt') {
        // 配列の場合、配列の各要素にカスタムクラスを適用
        if (Array.isArray(item[key]) && customClassMap[key]) {
          this[key] = item[key].map((element) => {
            return new customClassMap[key](element)
          })
        }
        // カスタムクラスのマッピングがある場合、そのクラスで再初期化
        else if (customClassMap[key] && item[key] instanceof Object) {
          this[key] = new customClassMap[key](item[key])
        }
        // オブジェクト以外のプリミティブ型（文字列、数値、ブールなど）の場合
        else if (typeof item[key] !== 'object') {
          this[key] = item[key]
        }
        // // 通常のオブジェクトの場合はディープコピー
        // else {
        //   this[key] = JSON.parse(JSON.stringify(item[key]))
        // }
        /**
         * 2024-10-12 修正
         * - 値が toDate を持っているようであれば Date オブジェクトに変換
         * - それ以外の場合はディープコピー
         */
        else if (item[key]?.toDate) {
          this[key] = item[key].toDate()
        } else {
          this[key] = JSON.parse(JSON.stringify(item[key]))
        }
      }
    })
  }

  /****************************************************************************
   * Firestore用のコンバーターを提供します。
   * - ドキュメントデータの保存および読み込み時に使用されます。
   *
   * @returns {Object} - Firestoreの`toFirestore`および`fromFirestore`メソッドを含むコンバーターオブジェクト
   ****************************************************************************/
  converter() {
    return {
      /**
       * インスタンスをFirestoreに保存する際の変換メソッドです。
       * @param {Object} instance - Firestoreに保存するクラスインスタンス
       * @returns {Object} - Firestoreに保存するためのオブジェクト形式
       */
      toFirestore: (instance) => instance.toObject(),

      /**
       * Firestoreから読み込んだデータをクラスインスタンスに変換するメソッドです。
       * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
       * @returns {Object} - クラスインスタンス
       */
      fromFirestore: (snapshot) => this.fromFirestore(snapshot),
    }
  }

  /****************************************************************************
   * クラスインスタンスを純粋なオブジェクトに変換します。
   * - 継承先のクラスで定義されたプロパティも含めて出力します。
   * - `enumerable: true`のプロパティのみを出力します。
   * - カスタムクラスが`toObject`を持たない場合はそのまま出力します。
   * - 値がない場合は`null`を出力します。
   * - 配列の各要素がカスタムクラスの場合も対応します。
   * - カスタムクラスを持たないオブジェクトはディープコピーします。
   *
   * @returns {Object} - Firestoreに保存可能なオブジェクト形式
   ****************************************************************************/
  toObject() {
    const obj = {}

    // プロトタイプチェーンをたどってプロパティを収集
    let currentObj = this
    while (currentObj !== null) {
      Object.entries(Object.getOwnPropertyDescriptors(currentObj)).forEach(
        ([key, descriptor]) => {
          if (descriptor.enumerable) {
            const value = this[key]

            // カスタムクラスがtoObjectメソッドを持っている場合は再帰的に呼び出す
            if (value && typeof value.toObject === 'function') {
              obj[key] = value.toObject()
            }
            // 配列の場合、各要素に対して再帰的にtoObjectを呼び出す
            else if (Array.isArray(value)) {
              obj[key] = value.map((item) => {
                // カスタムクラスの処理
                if (item && typeof item.toObject === 'function') {
                  return item.toObject()
                }
                // オブジェクトならディープコピー
                else if (item && typeof item === 'object') {
                  return JSON.parse(JSON.stringify(item))
                }
                // プリミティブ型はそのまま返す
                else {
                  return item
                }
              })
            }
            // カスタムクラスがtoObjectを持っていない場合はそのまま値を設定
            else if (value !== undefined) {
              obj[key] = value
            }
            // 値がnullまたはundefinedの場合はnullを設定
            else {
              obj[key] = null
            }
          }
        }
      )
      currentObj = Object.getPrototypeOf(currentObj)
    }

    return obj
  }

  /****************************************************************************
   * Firestoreから取得したデータをクラスインスタンスに変換します。
   * - カスタムクラスが定義されている場合、`customClassMap`を参照して適切なインスタンスを生成します。
   *
   * @param {Object} snapshot - Firestoreから取得したドキュメントスナップショット
   * @returns {Object} - クラスインスタンス
   ****************************************************************************/
  fromFirestore(snapshot) {
    const data = snapshot.data()

    // サブクラスで定義されたカスタムクラスのマッピング
    const customClassMap = this.constructor.customClassMap || {}

    // カスタムクラスの処理を行いつつ、データをインスタンスに初期化
    Object.keys(data).forEach((key) => {
      // 配列の場合、各要素にカスタムクラスを適用
      if (Array.isArray(data[key]) && customClassMap[key]) {
        data[key] = data[key].map((item) => new customClassMap[key](item))
      }
      // カスタムクラスのインスタンスに変換
      else if (customClassMap[key]) {
        data[key] = new customClassMap[key](data[key])
      }
    })

    // スーパークラスのインスタンス初期化を呼び出し、カスタムクラスを適用したデータを使用
    return new this.constructor(
      data,
      this.#collectionPath,
      this.#hasMany,
      this.#logicalDelete
    )
  }

  /****************************************************************************
   * ドキュメント作成前に実行されるメソッドです。
   * - `classProps`で定義されたプロパティについて、`validateProperties()`でチェックを行います。
   * - コレクション単位で必要な処理がある場合にオーバーライドして処理を追加してください。
   * - サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  beforeCreate() {
    return new Promise((resolve, reject) => {
      try {
        this.#validateProperties()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /****************************************************************************
   * ドキュメント作成後に実行されるメソッドです。
   * コレクション単位で必要な処理がある場合にオーバーライドして使用します。
   * サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  afterCreate() {
    return Promise.resolve()
  }

  /****************************************************************************
   * ドキュメント更新前に実行されるメソッドです。
   * - `classProps`で定義されたプロパティについて、`validateProperties()`でチェックを行います。
   * - コレクション単位で必要な処理がある場合にオーバーライドして処理を追加してください。
   * - サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  beforeUpdate() {
    return new Promise((resolve, reject) => {
      try {
        this.#validateProperties()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /****************************************************************************
   * ドキュメント更新後に実行されるメソッドです。
   * コレクション単位で必要な処理がある場合にオーバーライドして使用します。
   * サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  afterUpdate() {
    return Promise.resolve()
  }

  /****************************************************************************
   * ドキュメント削除前に実行されるメソッドです。
   * コレクション単位で必要な処理がある場合にオーバーライドして使用します。
   * サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  beforeDelete() {
    return Promise.resolve()
  }

  /****************************************************************************
   * ドキュメント削除後に実行されるメソッドです。
   * コレクション単位で必要な処理がある場合にオーバーライドして使用します。
   * サブクラスでこのメソッドをオーバーライドする際は、Promiseを返すようにしてください。
   * @returns {Promise<void>} - デフォルトでは、解決済みのPromiseを返します。
   ****************************************************************************/
  afterDelete() {
    return Promise.resolve()
  }

  /****************************************************************************
   * Firestore にドキュメントを書き込みます。
   * - `docId` を指定することで、特定のドキュメントIDを使用して作成することが可能です。
   * - `useAutonumber` が true の場合、自動採番を利用します。デフォルトは false です。
   * - `transaction` に Firestore のトランザクションオブジェクトを渡すことで、サブクラス側のトランザクション処理を継続します。
   * - `callBack` は、サブクラス側独自のトランザクション処理を実行するための引数です。
   *
   * @param {Object} [options={}] - オプション引数
   * @param {string|null} [options.docId=null] - 作成するドキュメントID。指定しない場合は自動生成されます。
   * @param {Object|null} [options.transaction=null] - Firestore のトランザクションオブジェクト。指定しない場合は自動トランザクションを使用します。
   * @param {function|null} [callBack=null] - サブクラス側でトランザクション処理を追加したい場合に指定するコールバック関数。トランザクションオブジェクトが渡されます。
   *
   * @returns {Promise<DocumentReference>} - 作成されたドキュメントの参照
   * @throws {Error} - ドキュメント作成中にエラーが発生した場合
   ****************************************************************************/
  async create({ docId = null, transaction = null } = {}, callBack = null) {
    const sender = `${this.#collectionPath} - create`

    // メッセージ出力
    const msg = docId ? 'CREATE_CALLED' : 'CREATE_CALLED_NO_DOCID'
    console.info(getMessage(sender, msg, docId)) // eslint-disable-line no-console

    // callBack が null 以外の場合は関数であることを確認
    if (callBack !== null && typeof callBack !== 'function') {
      throw new Error(`[${sender}] 'callBack' は関数である必要があります。`)
    }

    try {
      // ドキュメント作成準備
      this.createAt = new Date()
      this.updateAt = new Date()
      this.uid = 'cloud functions'
      const colRef = firestore.collection(this.#collectionPath)
      const docRef = docId
        ? colRef.doc(docId).withConverter(this.converter())
        : colRef.doc().withConverter(this.converter())
      this.docId = docRef.id

      await this.beforeCreate()

      /**
       * トランザクション処理でドキュメントを作成する関数です。
       * 1. `#useAutonumber` が true である場合、自動採番を行います。
       * 2. `callBack` が設定されている場合、これを実行します。
       * 3. ドキュメントを作成します。
       * 4. 最後に自動採番を更新します（必要な場合）。
       * @param {*} txn - Firestore のトランザクションオブジェクト
       */
      const performTransaction = async (txn) => {
        try {
          // 自動採番を行う場合、採番の更新を行う関数を取得
          const autonumberUpdater = this.#useAutonumber
            ? await this.#setAutonumber(txn, this)
            : null

          // サブクラスからのトランザクション処理がある場合に実行
          if (callBack) await callBack(txn, this.toObject())

          // ドキュメントを作成
          txn.set(docRef, this)

          // 自動採番の更新が必要な場合は実行
          if (autonumberUpdater) await autonumberUpdater()
        } catch (error) {
          // トランザクション処理中にエラーが発生した場合の処理
          error(
            `[performTransaction] トランザクション中にエラーが発生しました: ${error.message}`
          )
          throw new Error(
            `トランザクション中にエラーが発生しました: ${error.message}`
          )
        }
      }

      // 'transaction' の有無に応じて処理を分岐
      if (transaction) {
        await performTransaction(transaction)
      } else {
        await firestore.runTransaction(performTransaction)
      }

      // ドキュメント作成後の処理
      await this.afterCreate()

      // 成功メッセージ
      console.info(getMessage(sender, 'CREATE_DOC_SUCCESS', docRef.id)) // eslint-disable-line no-console
      return docRef
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      console.error(errorMsg) // eslint-disable-line no-console
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * Autonumbers コレクションから次の番号を取得し、指定されたフィールドにセットします。
   *
   * @param {Object} transaction - Firestore のトランザクションオブジェクト。採番とドキュメント作成がこのトランザクション内で行われます。
   * @param {Object} item - ドキュメントとして登録するデータオブジェクト。このオブジェクトに自動採番された値がセットされます。
   *
   * @returns {Promise<function>} - 自動採番の処理後に実行される更新関数を返します。この関数を呼び出すことで Autonumbers コレクションが更新されます。
   *
   * @throws {Error} - 自動採番処理が失敗した場合にエラーをスローします。
   ****************************************************************************/
  async #setAutonumber(transaction, item) {
    const sender = `${this.#collectionPath} - setAutonumber`

    try {
      const autonumRef = firestore
        .collection('Autonumbers')
        .doc(this.#collectionPath)
      const autonumDoc = await transaction.get(autonumRef)

      // Autonumberドキュメントが存在しない場合はエラーをスロー
      if (!autonumDoc.exists()) {
        throw new Error(getMessage(sender, 'MISSING_AUTONUMBER'))
      }

      const autonumData = autonumDoc.data()

      // Autonumberドキュメントのステータスが無効な場合はエラーをスロー
      if (!autonumData.status) {
        throw new Error(getMessage(sender, 'INVALID_AUTONUMBER_STATUS'))
      }

      // 採番処理
      const num = autonumData.current + 1
      const length = autonumData.length
      const newCode = (Array(length).join('0') + num).slice(-length)

      // 採番可能な最大値に達した場合はエラーをスロー
      const maxPossibleCode = Array(length + 1).join('0')
      if (newCode === maxPossibleCode) {
        throw new Error(getMessage(sender, 'NO_MORE_DOCUMENT'))
      }

      // itemに新しいコードをセット
      item[autonumData.field] = newCode

      // currentフィールドの更新処理を行う関数を返す
      return () => transaction.update(autonumRef, { current: num })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[${sender}] ${err.message}`)
      throw err
    }
  }

  /****************************************************************************
   * 指定されたドキュメントIDに該当するドキュメントを取得してプロパティにデータをセットします。
   * - 当該クラスのプロパティにデータをセットするため、`withConverter`を使っていません。
   * - ドキュメントの読み込みに成功すれば`true`を、そうでなければ`false`を返します。
   * @param {string} docId - 取得するドキュメントのID
   * @returns {Promise<boolean>} ドキュメントが存在した場合は`true`、存在しない場合は`false`を返します。
   * @throws {Error} ドキュメントIDが指定されていない場合、またはドキュメントの取得に失敗した場合
   ****************************************************************************/
  async fetch(docId = null) {
    const sender = 'FireModel - fetch'
    if (!docId) {
      throw new Error(getMessage(sender, 'FETCH_CALLED_NO_DOCID'))
    }

    // eslint-disable-next-line no-console
    info(getMessage(sender, 'FETCH_CALLED', this.#collectionPath, docId))

    try {
      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(docId)
      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        // eslint-disable-next-line no-console
        warn(getMessage(sender, 'FETCH_NO_DOCUMENT', docId))
        return false
      }
      this.initialize(docSnapshot.data())
      // eslint-disable-next-line no-console
      info(getMessage(sender, 'FETCH_SUCCESS'))
      return true
    } catch (err) {
      // eslint-disable-next-line no-console
      error(`[${sender}] ${err.message}`)
      throw new Error(`Document fetch failed: ${err.message}`)
    }
  }

  /****************************************************************************
   * 指定されたドキュメントIDに該当するドキュメントを取得して返します。
   * ‐ `fetch`と異なり、取得したドキュメントデータをインスタンス化された当該クラスのオブジェクトとして返します。
   * - 既にインスタンス化されたクラスオブジェクトはそのままに、新たなインスタンスが必要な場合に使用します。
   * @param {string} docId - 取得するドキュメントのID
   * @returns {Promise<Object|null>} - 取得されたドキュメントデータが返されます。ドキュメントが存在しない場合は`null`が返されます。
   ****************************************************************************/
  async fetchDoc(docId = null) {
    /* eslint-disable */
    const sender = 'FireModel - fetchDoc'
    if (!docId) {
      throw new Error(getMessage(sender, 'FETCH_DOC_CALLED_NO_DOCID'))
    }
    info(getMessage(sender, 'FETCH_DOC_CALLED', this.#collectionPath, docId))
    try {
      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(docId).withConverter(this.converter())
      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        warn(getMessage(sender, 'FETCH_DOC_NO_DOCUMENT', docId))
        return null
      }
      info(getMessage(sender, 'FETCH_DOC_SUCCESS'))
      return docSnapshot.data()
    } catch (err) {
      error(`[${sender}] ${err.message}`)
      throw err
    }
    /* eslint-enable */
  }

  /****************************************************************************
   * Firestoreコレクションから条件に一致するドキュメントを取得します。
   * @param {Array|string} constraints - クエリ条件の配列
   * @returns {Promise<Array<Object>>} - 取得したドキュメントのデータで初期化されたオブジェクトの配列
   * @throws {Error} 不明なクエリタイプが指定された場合
   ****************************************************************************/
  async fetchDocs(constraints = []) {
    const colRef = firestore.collection(this.#collectionPath)
    let q = colRef
    const validQueryTypes = ['where', 'orderBy', 'limit']
    constraints.forEach((constraint) => {
      const [type, ...args] = constraint
      switch (type) {
        case 'where':
          q = q.where(...args)
          break
        case 'orderBy':
          q = q.orderBy(args[0], args[1] || 'asc')
          break
        case 'limit':
          q = q.limit(args[0])
          break
        default:
          warn(
            `Unknown query type: ${type}. Valid query types are: ${validQueryTypes.join(
              ', '
            )}`
          )
          throw new Error(
            `Invalid query type: ${type}. Please use one of: ${validQueryTypes.join(
              ', '
            )}`
          )
      }
    })

    q = q.withConverter(this.converter())

    // Firestoreクエリの実行
    const querySnapshot = await q.get()

    // 取得したドキュメントデータをオブジェクトの配列に変換して返却
    return querySnapshot.docs.map((doc) => doc.data())
  }

  /****************************************************************************
   * Firestore ドキュメントを現在のプロパティ値で更新します。
   * - Firestore の `updateDoc` メソッドは `withConverter` をサポートしていないため、 `toObject()` を使用してオブジェクト形式に変換します。
   *
   * @param {function|null} transaction - トランザクション処理を行うための関数（省略可能、デフォルトは `null`）
   * @param {function|null} callBack - サブクラス側で独自の処理を実行するための関数（省略可能、デフォルトは `null`）
   * @returns {Promise<DocumentReference>} - 更新された Firestore ドキュメントの参照を返します。
   * @throws {Error} - ドキュメント更新中にエラーが発生した場合にスローされます。
   ****************************************************************************/
  async update({ transaction = null } = {}, callBack = null) {
    const sender = `${this.#collectionPath} - update`

    // 更新呼び出しのログ出力
    console.info(getMessage(sender, 'UPDATE_CALLED', this.docId)) // eslint-disable-line no-console

    // callBackがnull以外の場合は関数であることを確認
    if (callBack !== null && typeof callBack !== 'function') {
      throw new Error(`[${sender}] 'callBack'は関数である必要があります。`)
    }

    try {
      // ドキュメントIDが存在しない場合はエラーをスロー
      if (!this.docId) {
        throw new Error(getMessage(sender, 'UPDATE_REQUIRES_DOCID'))
      }

      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(this.docId) // updateDocの場合、withConverter.toFirestoreは使用できない。

      // 更新前処理
      await this.beforeUpdate()

      // 更新日時とユーザーIDの設定
      this.updateAt = new Date()
      this.uid = 'cloud functions'

      /**
       * トランザクション処理でドキュメントを更新する関数です。
       * 1. 更新対象のドキュメントが存在するかを確認します。
       * 2. `callBack` が設定されている場合、これを実行します。
       * 3. 最後にドキュメントを更新します。
       * @param {*} txn - Firestore のトランザクションオブジェクト
       */
      const performTransaction = async (txn) => {
        try {
          if (callBack) await callBack(txn, this.toObject())
          txn.update(docRef, this.toObject())
        } catch (error) {
          // eslint-disable-next-line
          console.error(
            `[performTransaction] トランザクション中にエラーが発生しました: ${error.message}`
          )
          throw new Error(
            `トランザクション中にエラーが発生しました: ${error.message}`
          )
        }
      }

      // ドキュメントの更新処理
      if (transaction) {
        await performTransaction(transaction)
      } else {
        await firestore.runTransaction(performTransaction)
      }

      // 更新後処理
      await this.afterUpdate()

      // 成功ログ出力
      console.info(getMessage(sender, 'UPDATE_DOC_SUCCESS', this.docId)) // eslint-disable-line no-console
      return docRef
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      console.error(errorMsg) // eslint-disable-line no-console
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * `hasMany` プロパティにセットされた条件に基づき、現在のドキュメントに依存している子ドキュメントが
   * 存在しているかどうかを確認します。
   *
   * @returns {Promise<object|boolean>} - 子ドキュメントが存在する場合は `hasMany` の該当項目を返し、
   *                                      存在しない場合は `false` を返します。
   * @throws {Error} - Firestore の操作中にエラーが発生した場合にスローされます。
   ****************************************************************************/
  async hasChild() {
    try {
      for (const item of this.#hasMany) {
        // コレクションまたはコレクショングループの参照を取得
        const colRef =
          item.type === 'collection'
            ? firestore.collection(item.collection)
            : firestore.collectionGroup(item.collection)

        // クエリを作成
        const q = colRef.where(item.field, item.condition, this.docId)
        // トランザクションの有無に応じてクエリを実行
        const snapshot = await q.get(q)

        // 子ドキュメントが存在する場合、該当の `hasMany` アイテムを返す
        if (!snapshot.empty) return item
      }

      // 子ドキュメントが存在しない場合は `false` を返す
      return false
    } catch (error) {
      console.error(`Error in hasChild: ${error.message}`) // eslint-disable-line no-console
      throw new Error(`Error checking for child documents: ${error.message}`)
    }
  }

  /****************************************************************************
   * 現在のドキュメントIDに該当するドキュメントを削除します。
   * - `logicalDelete`が指定されている場合、削除されたドキュメントは`archive`コレクションに移動されます。
   * - `transaction`が指定されている場合は`deleteAsTransaction`を呼び出します。
   * @param {object|null} transaction - Firestoreトランザクションオブジェクト（省略可能）
   * @param {function|null} callBack - サブクラス側で独自の処理を実行するための関数（省略可能）
   * @returns {Promise<void>} - 削除が完了すると解決されるPromise
   * @throws {Error} - ドキュメントの削除中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async delete({ transaction = null } = {}, callBack = null) {
    const sender = `${this.#collectionPath} - delete`

    // 削除処理のログを出力
    console.info(getMessage(sender, 'DELETE_CALLED', this.docId)) // eslint-disable-line no-console

    // callBackがnull以外の場合は関数であることを確認
    if (callBack !== null && typeof callBack !== 'function') {
      throw new Error(`[${sender}] 'callBack'は関数である必要があります。`)
    }

    try {
      // ドキュメントIDが存在しない場合のエラー処理
      if (!this.docId) {
        throw new Error(getMessage(sender, 'DELETE_REQUIRES_DOCID'))
      }

      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(this.docId)

      // 削除前処理
      await this.beforeDelete()

      /**
       * トランザクションでドキュメントを削除する関数です。
       * @param {object} txn - Firestoreトランザクションオブジェクト
       */
      const performTransaction = async (txn) => {
        // 子ドキュメントが存在する場合のエラー処理
        const hasChild = await this.hasChild()
        if (hasChild) {
          throw new Error(
            getMessage(
              sender,
              'COULD_NOT_DELETE_CHILD_EXIST',
              hasChild.collection
            )
          )
        }

        const docSnapshot = await docRef.get()
        if (!docSnapshot.exists) {
          throw new Error(
            getMessage(sender, 'NO_DOCUMENT_TO_DELETE', this.docId)
          )
        }
        const sourceData = docSnapshot.data()

        // サブクラスでの追加処理を実行
        if (callBack) await callBack(txn, this.toObject())

        if (this.#logicalDelete) {
          // 論理削除：archiveコレクションに移動し、元のドキュメントを削除
          const archiveColRef = firestore.collection(
            `${this.#collectionPath}_archive`
          )
          const archiveDocRef = archiveColRef.doc(this.docId)
          txn.set(archiveDocRef, sourceData)
        }

        // 元のドキュメントを削除（物理削除または論理削除後）
        txn.delete(docRef)
      }

      // ドキュメントの削除処理
      if (transaction) {
        await performTransaction(transaction)
      } else {
        await firestore.runTransaction(performTransaction)
      }

      // 削除後処理
      await this.afterDelete()

      // 成功ログ出力
      console.info(getMessage(sender, 'DELETE_DOC_SUCCESS', this.docId)) // eslint-disable-line no-console
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      console.error(errorMsg) // eslint-disable-line no-console
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * コレクション内のドキュメントをすべて削除します。
   * - 大量のドキュメントが存在する場合の負荷を分散するため、一度に処理するドキュメント数を制限することができます。
   * - 一度に処理するドキュメント数の既定値は500件です。
   * - 同時に、削除処理ごとの待機時間をミリ秒で設定することが可能です。
   * - 待機時間の既定値は500ミリ秒です。
   * @param {number} batchSize 一度の処理するドキュメントの最大数
   * @param {number} pauseDuration 処理を待機する時間（ミリ秒）
   * @returns {Promise<void>} - すべての処理が完了すると解決されるPromise
   ****************************************************************************/
  async deleteAll(batchSize = 500, pauseDuration = 500) {
    const sender = 'FireModel - deleteAll'
    info(getMessage(sender, 'DELETE_ALL_CALLED', this.#collectionPath))
    // 引数のバリデーション
    if (typeof batchSize !== 'number' || batchSize <= 0) {
      throw new Error(getMessage(sender, 'DELETE_ALL_INVALID_BATCH_SIZE'))
    }
    if (typeof pauseDuration !== 'number' || pauseDuration < 0) {
      throw new Error(getMessage(sender, 'DELETE_ALL_INVALID_PAUSE_DURATION'))
    }

    const colRef = firestore.collection(this.#collectionPath)
    let snapshot

    try {
      do {
        // snapshot = await getDocs(query(colRef, limit(batchSize)));
        snapshot = await colRef.limig(batchSize).get()
        if (snapshot.empty) break

        // const batch = writeBatch(firestore);
        const batch = firestore.batch()
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref)
        })

        await batch.commit()

        // 処理を分散するために指定した時間だけ待機する
        if (pauseDuration > 0) {
          await new Promise((resolve) => setTimeout(resolve, pauseDuration))
        }
      } while (!snapshot.empty)
    } catch (err) {
      error(`[${sender}] ${err.message}`)
      throw err
    }
  }

  /****************************************************************************
   * 削除されたドキュメントをアーカイブコレクションから元のコレクションに復元します。
   * @param {string} docId - 復元するドキュメントのID
   * @returns {Promise<DocumentReference>} - 復元されたドキュメントの参照
   * @throws {Error} - ドキュメントIDが指定されていない場合や、復元するドキュメントが存在しない場合にエラーをスローします
   ****************************************************************************/
  async restore(docId) {
    /* eslint-disable */
    const sender = 'FireModel - restore'
    if (!docId) {
      throw new Error(getMessage(sender, 'RESTORE_CALLED_NO_DOCID'))
    } else {
      info(getMessage(sender, 'RESTORE_CALLED', docId))
    }
    try {
      const archivePath = `${this.#collectionPath}_archive`
      // const archiveColRef = collection(firestore, archivePath);
      const archiveColRef = firestore.collection(archivePath)
      // const archiveDocRef = doc(archiveColRef, docId);
      const archiveDocRef = archiveColRef.doc(docId)
      // const docSnapshot = await getDoc(archiveDocRef);
      const docSnapshot = await archiveDocRef.get()
      if (!docSnapshot.exists) {
        throw new Error(
          getMessage(sender, 'NO_DOCUMENT_TO_RESTORE', archivePath, docId)
        )
      }
      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(docId)
      // const batch = writeBatch(firestore);
      const batch = firestore.batch()
      batch.delete(archiveDocRef)
      batch.set(docRef, docSnapshot.data())
      await batch.commit()
      info(getMessage(sender, 'RESTORE_SUCCESS', this.#collectionPath, docId))
      return docRef
    } catch (err) {
      error(`[${sender}] ${err.message}`)
      throw err
    }
    /* eslint-enable */
  }
}
