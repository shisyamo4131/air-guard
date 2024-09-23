const { getFirestore } = require('firebase-admin/firestore')
const { error, info, warn } = require('firebase-functions/logger')
const { getMessage } = require('./firestore-messages.js')
const firestore = getFirestore()
/**
 * [Cloud Functions用にカスタマイズしたバージョン]
 * FireModelクラスは、Firestoreコレクションに対する基本的なCRUD操作を提供するための基盤クラスです。
 * このクラスを継承して、特定のコレクションに対応するデータモデルを実装できます。
 *
 * 主な機能:
 * - Firestoreコレクションに対するドキュメントの作成、読み込み、更新、削除（CRUD）操作をサポート
 * - Firestoreクエリを使用した複数ドキュメントの取得
 * - 自動採番機能を利用したドキュメント作成
 * - 論理削除のオプションを提供し、削除されたドキュメントをアーカイブコレクションに移動可能
 * - Firestoreのリアルタイムリスナーを使用したドキュメントの監視
 * - 依存するコレクション（hasMany）の管理
 * - Firestoreの脆弱なクエリを補うため、指定されたプロパティに対するtokenMapを生成します。
 *
 * 使用方法:
 * このクラスは直接使用せず、特定のコレクションに対応するサブクラスを作成して使用します。
 * サブクラスで独自のフィールドやメソッドを追加することで、特定のビジネスロジックに対応可能です。
 *
 * コンストラクタの使用例:
 * ```javascript
 * class OrderModel extends FireModel {
 *   constructor(data = {}) {
 *     super(
 *       data,
 *       'orders',
 *       [
 *         { collection: 'orderItems', field: 'orderId', condition: '==', type: 'subcollection' }
 *       ],
 *       true // `true` は論理削除を有効にするフラグ,
 *       tokenFields: ['name']
 *     );
 *   }
 *
 *   // サブクラスで使用するプロパティはinitializeメソッドで定義します。
 *   // Object.definePropertyを使用する場合はconstructor内に定義します。
 *   initialize(item = {}) {
 *     this.name = ''
 *     super.initialize(item)
 *   }
 *
 *   // OrderModelに固有のメソッドを追加
 *   calculateTotal() {
 *     return this.items.reduce((total, item) => total + item.price, 0);
 *   }
 * }
 * ```
 * - `collectionPath`: 'orders'は、このモデルが対象とするFirestoreコレクションのパスです。
 * - `hasMany`: 'orderItems'ドキュメントが`orders`ドキュメントに依存していることを表します。
 *   この設定により`orderItems`ドキュメントが存在する`orders`ドキュメントの削除を抑制することができます。
 * - `logicalDelete`: `true`に設定することで、ドキュメントの削除時に論理削除が適用され、ドキュメントはアーカイブされます。
 * - `tokenFields`: tokenMapとして生成する対象のプロパティを指定します。
 *
 * tokenMap:
 * - Firestoreの脆弱なクエリを補完するための、Ngram検索を行うためのフィールドです。
 * - Firestoreのデータのkeyに使用することができないため、サロゲートペア文字列は除外されます。
 *
 * classProps:
 * - このクラスはbeforeCreate、beforeUpdateで`classProps`に定義されたプロパティの入力チェックを行います。
 * - `classProps`はクラスで使用するプロパティを以下の形式で定義したものです。
 *    docId: { type: String, default: '', required: false, requiredByClass: false }
 * - 自動採番で値がセットされるプロパティには`requiredByClass`をtrueにしないでください。
 *   validatePropertiesは自動採番が行われる前に実行されるため、エラーになります。
 *
 * createメソッド:
 * ‐ `transaction`引数を与えると、トランザクション処理を行います。
 *
 * 注意:
 * - このクラスは、FirestoreのドキュメントIDや作成日時、更新日時、ユーザーIDなどのメタデータを自動管理します。
 * - コレクション間の依存関係（hasMany）は、このクラスを通じて管理され、削除時の整合性を保証します。
 * - 論理削除を有効にした場合、削除されたドキュメントは自動的にアーカイブコレクションに移動されます。
 * - Firestoreのリアルタイムリスナーを活用することで、ドキュメントの変更をリアルタイムで監視し、自動的にデータモデルに反映します。
 *
 * @author shisyamo4131
 * @version 1.4.0
 * @see https://firebase.google.com/docs/firestore
 * @updates
 * - version 1.6.0 - 2024-09-04 - cloneメソッドを追加
 * - version 1.5.0 - 2024-08-27 - create、update、deleteがtransactionを引数として受け取ることができるように改善。
 * - version 1.4.0 - 2024-08-26 - validatePropertiesを実装し、beforeCreate、beforeUpdateで入力チェックを行うように修正
 *                              - サブクラスでのプロパティ初期化処理をinitializeメソッドにて実装
 *                              - tokenMapに`configurable`を設定。
 * - version 1.3.0 - 2024-08-23 - deleteAll()を実装
 *                              - fetch()が結果に応じて`Boolean`を返すように修正
 * - version 1.2.0 - 2024-08-22 - converterをプライベートからパブリックに変更
 *                              - fromFirestoreをオーバーライド可能な関数として実装
 * - version 1.1.0 - 2024-08-21 - tokenMapフィールドを追加
 *                              - constructorのhasManyについて内容をチェックするコードを追加
 * - version 1.0.0 - 2024-08-19 - 初版完成
 */
class FireModel {
  /**
   * ドキュメントのコレクションパスです。
   */
  #collectionPath = ''

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

  /**
   * ドキュメントの削除時に論理削除を適用するかどうかを表すフラグです。
   */
  #logicalDelete = false

  /**
   * tokenMapに反映させるフィールドのリストです。
   */
  #tokenFields = []

  #classProps = {}

  /**
   * FireModelクラスのインスタンスを初期化します。
   * このクラスはFirestoreコレクションのCRUD操作をサポートし、
   * 依存関係のあるコレクションの管理や論理削除の処理も可能です。
   *
   * @param {Object} item - 初期化するデータモデルのプロパティを含むオブジェクト
   * @param {string} collectionPath - Firestoreコレクションのパス
   * @param {Array<Object>} hasMany - 依存するコレクションの情報を格納した配列
   * @param {boolean} logicalDelete - 論理削除を行うかどうかを指定するフラグ
   * @param {Array<Object>} tokenFields - tokenMap作成対象のプロパティ名の配列
   * @param {Object} classProps - クラスに用意するプロパティの定義を表したオブジェクト
   */
  constructor(
    item = {},
    collectionPath = '',
    hasMany = [],
    logicalDelete = false,
    tokenFields = [],
    classProps = {}
  ) {
    this.#collectionPath = collectionPath
    this.#validateHasMany(hasMany)
    this.#hasMany = hasMany
    this.#logicalDelete = logicalDelete
    this.#tokenFields = tokenFields
    this.#classProps = classProps
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
   * 当該インスタンスを複製したインスタンスを返します。
   * - vueコンポーネントにおいてインスタンスを親に返す場合など、参照渡しを回避するのに使用します。
   * @returns {this.constructor} - 複製された新しいインスタンス
   ****************************************************************************/
  clone() {
    return new this.constructor(this)
  }

  /****************************************************************************
   * コンストラクタに引き渡されたhasManyについて検証します。
   * - hasManyプロパティは配列である必要があります。
   * - 各要素はオブジェクトであり、必要なプロパティを持っていることを確認します。
   * - 必須キーは "collection", "field", "condition", "type" です。
   * - "type" プロパティには "collection" または "subcollection" のみを指定できます。
   *
   * @param {Array<Object>} hasMany コンストラクタで受け取ったhasMany
   * @throws {Error} バリデーションに失敗した場合にエラーをスローします。
   ****************************************************************************/
  #validateHasMany(hasMany) {
    if (!Array.isArray(hasMany)) {
      throw new TypeError('hasManyプロパティは配列である必要があります。')
    }

    hasMany.forEach((relation, index) => {
      const requiredKeys = ['collection', 'field', 'condition', 'type']
      const allowedKeys = new Set(requiredKeys)

      // 各要素がオブジェクトであることを確認
      if (typeof relation !== 'object' || relation === null) {
        throw new Error(
          `hasManyプロパティの要素はオブジェクトである必要があります。インデックス: ${index}, 値: ${JSON.stringify(
            relation
          )}`
        )
      }

      // 必須のキーがすべて存在することを確認
      requiredKeys.forEach((key) => {
        if (!(key in relation)) {
          throw new Error(
            `hasManyプロパティの要素には${key}プロパティが必要です。インデックス: ${index}, 値: ${JSON.stringify(
              relation
            )}`
          )
        }
      })

      // 余分なキーがないことを確認
      Object.keys(relation).forEach((key) => {
        if (!allowedKeys.has(key)) {
          throw new Error(
            `hasManyプロパティの要素に無効なプロパティ${key}が含まれています。インデックス: ${index}, 値: ${JSON.stringify(
              relation
            )}`
          )
        }
      })

      // typeプロパティの値を確認
      const validTypes = ['collection', 'subcollection']
      if (!validTypes.includes(relation.type)) {
        throw new Error(
          `hasManyプロパティのtypeプロパティには'collection'または'subcollection'のみ使用できます。インデックス: ${index}, 値: ${JSON.stringify(
            relation
          )}`
        )
      }
    })
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
  validateProperties() {
    Object.keys(this.#classProps).forEach((key) => {
      const propConfig = this.#classProps[key]
      // 必須チェック
      if (
        propConfig.required &&
        (this[key] === undefined || this[key] === null || this[key] === '')
      ) {
        throw new Error(`${key}は必須です。`)
      }

      // バリデーションチェック
      if (propConfig.validator && !propConfig.validator(this[key])) {
        throw new Error(`${key}の値が無効です: ${this[key]}`)
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
        // 通常のオブジェクトの場合はディープコピー
        else {
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
        this.validateProperties()
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
        this.validateProperties()
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
   * ドキュメントを書き込みます。
   * ‐ docIdを指定することで、ドキュメントIDを指定した書き込みを行うことが可能です。
   * - useAutonumberをtrueにすると自動採番を行います。
   * - useAutonumberの既定値はfalseです。
   * - 自動採番を行うコレクションの場合、このメソッドをオーバーライドし、useAutonumberの既定値をtrueにすることをお勧めします。
   * - transactionを引数に渡すことでトランザクション処理を行うことが可能です。
   * @param {string|null} docId - 指定されたドキュメントID（省略可能）
   * @param {boolean} useAutonumber - 自動採番を行うかどうかのフラグ（省略可能）
   * @param {object|null} transaction - Firestoreトランザクションオブジェクト（省略可能）
   * @returns {Promise<DocumentReference>} - 作成されたドキュメントのリファレンス
   * @throws {Error} - ドキュメントの作成中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async create({
    docId = null,
    useAutonumber = false,
    transaction = null,
  } = {}) {
    const sender = 'FireModel - create'

    // メッセージ出力
    if (docId) {
      // eslint-disable-next-line no-console
      info(getMessage(sender, 'CREATE_CALLED', docId))
    } else {
      // eslint-disable-next-line no-console
      info(getMessage(sender, 'CREATE_CALLED_NO_DOCID'))
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

      // ドキュメント作成処理
      if (useAutonumber) {
        if (transaction) {
          await this.#createWithAutonumber(transaction, this)
          transaction.set(docRef, this)
        } else {
          await firestore.runTransaction(async (newTransaction) => {
            await this.#createWithAutonumber(newTransaction, this)
            newTransaction.set(docRef, this)
          })
        }
      } else {
        ;(await transaction) ? transaction.set(docRef, this) : docRef.set(this)
      }

      // ドキュメント作成後の処理
      await this.afterCreate()

      // 成功メッセージ
      info(
        getMessage(
          sender,
          'CREATE_DOC_SUCCESS',
          this.#collectionPath,
          docRef.id
        )
      )
      return docRef
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      // eslint-disable-next-line no-console
      error(errorMsg)
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * 自動採番を利用してドキュメントを作成します。
   * @param {Object} transaction Firestoreのトランザクションオブジェクト
   * @param {Object} item ドキュメントとして登録するデータオブジェクト
   * @returns {Promise<void>} - ドキュメントが存在しない場合は警告を出力し、存在する場合はプロパティにデータをセットします。
   ****************************************************************************/
  async #createWithAutonumber(transaction, item) {
    /* eslint-disable */
    const sender = 'FireModel - createWithAutonumber'
    try {
      const autonumRef = firestore
        .collection(`Autonumbers`)
        .doc(this.#collectionPath)
      const autonumDoc = await transaction.get(autonumRef)
      if (!autonumDoc.exists) {
        throw new Error(
          getMessage(sender, 'MISSING_AUTONUMBER', this.#collectionPath)
        )
      }
      if (!autonumDoc.data().status) {
        throw new Error(
          getMessage(sender, 'INVALID_AUTONUMBER_STATUS', this.#collectionPath)
        )
      }
      const num = autonumDoc.data().current + 1
      const length = autonumDoc.data().length
      const newCode = (Array(length).join('0') + num).slice(-length)
      const maxPossibleCode = Array(length + 1).join('0')
      if (newCode === maxPossibleCode) {
        throw new Error(
          getMessage(sender, 'NO_MORE_DOCUMENT', this.#collectionPath)
        )
      }
      item[autonumDoc.data().field] = newCode
      transaction.update(autonumRef, { current: num })
    } catch (err) {
      error(`[${sender}] ${err.message}`)
      throw err
    }
    /* eslint-enable */
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
    const q = colRef
    const validQueryTypes = ['where', 'orderBy', 'limit']
    constraints.forEach((constraint) => {
      const [type, ...args] = constraint
      switch (type) {
        case 'where':
          q.where(...args)
          break
        case 'orderBy':
          q.orderBy(args[0], args[1] || 'asc')
          break
        case 'limit':
          q.limit(args[0])
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

    q.withConverter(this.converter())

    // Firestoreクエリの実行
    const querySnapshot = await q.get()

    // 取得したドキュメントデータをオブジェクトの配列に変換して返却
    return querySnapshot.docs.map((doc) => doc.data())
  }

  /****************************************************************************
   * 現在プロパティにセットされている値で、ドキュメントを更新します。
   * - FirestoreのupdateメソッドはwithConverterを受け付けないため、toObject()を使用しています。
   * @param {object|null} transaction - Firestoreトランザクションオブジェクト（省略可能）
   * @returns {Promise<DocumentReference>} 更新したドキュメントへの参照
   * @throws {Error} ドキュメントの更新中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async update({ transaction = null } = {}) {
    const sender = 'FireModel - update'

    // 更新呼び出しのログ出力
    info(getMessage(sender, 'UPDATE_CALLED', this.docId))

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

      // ドキュメントの更新処理
      // await updateDoc(docRef, this.toObject());
      await (transaction
        ? transaction.update(docRef, this.toObject())
        : docRef.update(this.toObject()))
      // : updateDoc(docRef, this.toObject()));

      // 更新後処理
      await this.afterUpdate()

      // 成功ログ出力
      info(
        getMessage(
          sender,
          'UPDATE_DOC_SUCCESS',
          this.#collectionPath,
          this.docId
        )
      )
      return docRef
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      // eslint-disable-next-line no-console
      error(errorMsg)
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * `hasMany`プロパティにセットされた条件に基づいて、当該クラスに読み込まれているドキュメントデータに
   * 依存している子ドキュメントが存在しているかどうかを返します。
   * @returns {Promise<object|boolean>} - 子ドキュメントが存在する場合は`hasMany`の該当項目を返し、存在しない場合は`false`を返します。
   ****************************************************************************/
  async hasChild() {
    for (const item of this.#hasMany) {
      const colRef =
        item.type === 'collection'
          ? firestore.collection(item.collection)
          : firestore.collectionGroup(item.collection)

      const q = colRef.where(item.field, item.condition, this.docId).limit(1)
      const snapshot = await q.get()

      if (!snapshot.empty) return item
    }

    return false
  }

  /****************************************************************************
   * 現在のドキュメントIDに該当するドキュメントを削除します。
   * - `logicalDelete`が指定されている場合、削除されたドキュメントはarchiveコレクションに移動されます。
   * - `transaction`が指定されている場合は`deleteAsTransaction`を呼び出します。
   * @param {object|null} transaction - Firestoreトランザクションオブジェクト（省略可能）
   * @returns {Promise<void>} - 削除が完了すると解決されるPromise
   * @throws {Error} - ドキュメントの削除中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async delete({ transaction = null } = {}) {
    const sender = `${this.constructor.name} - delete`

    // トランザクションで論理削除は不可能
    if (transaction && this.#logicalDelete) {
      const errorMsg = `Error in ${sender}: Could not transaction delete with logical delete.`
      error(errorMsg)
      throw new Error(errorMsg)
    }

    // トランザクション処理の場合
    if (transaction) {
      try {
        await this.#deleteAsTransaction(transaction)
        return
      } catch (err) {
        const errorMsg = `Error in ${sender}: ${err.message}`
        error(errorMsg)
        throw new Error(errorMsg)
      }
    }

    // 削除処理のログを出力
    info(getMessage(sender, 'DELETE_CALLED', this.docId))

    try {
      // ドキュメントIDが存在しない場合のエラー処理
      if (!this.docId) {
        throw new Error(getMessage(sender, 'DELETE_REQUIRES_DOCID'))
      }

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

      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(this.docId)

      // ドキュメントの存在確認
      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists()) {
        throw new Error(
          getMessage(
            sender,
            'NO_DOCUMENT_TO_DELETE',
            this.#collectionPath,
            this.docId
          )
        )
      }

      // 削除前処理
      await this.beforeDelete()

      // 論理削除が指定されている場合
      if (this.#logicalDelete) {
        const archiveColRef = firestore.collection(
          `${this.#collectionPath}_archive`
        )
        const archiveDocRef = archiveColRef.doc(this.docId)

        await firestore.runTransaction((newTransaction) => {
          newTransaction.set(archiveDocRef, docSnapshot.data())
          newTransaction.delete(docRef)
        })
      } else {
        // 物理削除
        await docRef.delete(docRef)
      }

      // 削除後処理
      await this.afterDelete()

      // 成功ログ出力
      info(
        getMessage(
          sender,
          'DELETE_DOC_SUCCESS',
          this.#collectionPath,
          this.docId
        )
      )
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      error(errorMsg)
      throw new Error(errorMsg)
    }
  }

  /****************************************************************************
   * 現在のドキュメントIDに該当するドキュメントをトランザクション処理で削除します。
   * - このメソッドはdelete()から呼び出されます。
   * @param {object|null} transaction - Firestoreトランザクションオブジェクト（省略可能）
   * @returns {Promise<void>} - 削除が完了すると解決されるPromise
   * @throws {Error} - ドキュメントの削除中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async #deleteAsTransaction(transaction) {
    const sender = `${this.constructor.name} - deleteAsTransaction`

    // 削除呼び出しのログ出力
    info(getMessage(sender, 'DELETE_CALLED', this.docId))

    try {
      // ドキュメントIDが存在しない場合はエラーをスロー
      if (!this.docId) {
        throw new Error(getMessage(sender, 'DELETE_REQUIRES_DOCID'))
      }

      const colRef = firestore.collection(this.#collectionPath)
      const docRef = colRef.doc(this.docId)

      await transaction.delete(docRef)

      // 成功ログ出力
      info(
        getMessage(
          sender,
          'DELETE_DOC_SUCCESS',
          this.#collectionPath,
          this.docId
        )
      )
    } catch (err) {
      const errorMsg = `Error in ${sender}: ${err.message}`
      error(errorMsg)
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
   * @returns {Promise<DocumentReference>} - 復元されたドキュメントのリファレンス
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

module.exports = FireModel
