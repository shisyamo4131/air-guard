import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import FireModel from './FireModel.js'
import { classProps } from './propsDefinition/Employee.js'
import EmployeeIndex from './EmployeeIndex.js'
const database = getDatabase()
const firestore = getFirestore()

/**
 * Employeesドキュメントデータモデル【論理削除】
 *
 * - 従業員情報を管理するデータモデルです。
 * - `code`は Autonumbers による自動採番が行われます。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Employee extends FireModel {
  /****************************************************************************
   * STATIC
   ****************************************************************************/
  static collectionPath = 'Employees'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['lastNameKana', 'firstNameKana', 'abbr']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'EmployeeMedicalCheckups',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'OperationResults',
      field: 'employeeIds',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
    delete this.create
    delete this.update
    delete this.delete
    Object.defineProperties(this, {
      fullName: {
        enumerable: true,
        get() {
          if (!this.lastName || !this.firstName) return ''
          return `${this.lastName} ${this.firstName}`
        },
        set(v) {},
      },
      fullNameKana: {
        enumerable: true,
        get() {
          if (!this.lastNameKana || !this.firstNameKana) return ''
          return `${this.lastNameKana} ${this.firstNameKana}`
        },
        set(v) {},
      },
    })
  }

  /****************************************************************************
   * initializeメソッドをオーバーライドします。
   * - AirGuardからのインポート処理を想定した初期化処理を追加しています。
   * @param {Object} item
   ****************************************************************************/
  initialize(item = {}) {
    // isForeigner が Boolean かどうかチェックし、文字列 '1' の場合には true に変換
    if (typeof item.isForeigner !== 'boolean') {
      item.isForeigner = item.isForeigner === '1' // '1' ならば true に変換
    }

    // hasSendAddress が Boolean かどうかチェックし、文字列 '2' の場合には true に変換
    if (typeof item.hasSendAddress !== 'boolean') {
      item.hasSendAddress = item.hasSendAddress === '2' // '2' ならば true に変換
    }

    super.initialize(item)
  }

  /****************************************************************************
   * クラスプロパティの状態に応じて、他のプロパティの値を初期化します。
   * - `isForeigner`がfalseの場合、`nationality`を初期化します。
   * - `leaveDate`が空の場合、`leaveReason`を初期化します。
   * - `hasSendAddress`がfalseの場合、`sendZipcode`、`sendAddress1`、`sendAddress2`に
   *   `zipcode`、`address1`、`address2`をセットします。
   ****************************************************************************/
  #initializeDependentProperties() {
    if (!this.isForeigner) this.nationality = ''
    if (!this.leaveDate) this.leaveReason = ''
    // 送付先住所がなければ登録住所を送付先住所に複製
    if (!this.hasSendAddress) {
      this.sendZipcode = this.zipcode
      this.sendAddress1 = this.address1
      this.sendAddress2 = this.address2
    }
  }

  /****************************************************************************
   * FireModelのbeforeCreateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeCreate() {
    this.#initializeDependentProperties()
    await super.beforeCreate()
  }

  /****************************************************************************
   * FireModelのbeforeUpdateをオーバーライドします。
   * - 依存プロパティを初期化します。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   ****************************************************************************/
  async beforeUpdate() {
    this.#initializeDependentProperties()
    await super.beforeUpdate()
  }

  /****************************************************************************
   * 指定された従業員codeに該当する従業員ドキュメントデータを配列で返します。
   * @param {string} code - 従業員コード
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - エラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCode(code) {
    if (!code) throw new Error('従業員コードは必須です。')
    try {
      const constraints = [['where', 'code', '==', code]]
      const snapshots = await this.fetchDocs(constraints)
      return snapshots
    } catch (err) {
      const message = `[Employee.js fetchByCode] 従業員コード ${code} に対するドキュメントの取得に失敗しました: ${err.message}`
      logger.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 従業員codeの配列を受け取り、該当する従業員ドキュメントデータを配列で返します。
   * 従業員codeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes - 従業員コードの配列
   * @returns {Promise<Array>} - 従業員ドキュメントデータの配列
   * @throws {Error} - 処理中にエラーが発生した場合にスローされます
   ****************************************************************************/
  async fetchByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) return []
    try {
      const unique = [...new Set(codes)]
      const chunked = unique.flatMap((_, i) =>
        i % 30 ? [] : [unique.slice(i, i + 30)]
      )
      const promises = chunked.map((arr) => {
        const constraints = [['where', 'code', 'in', arr]]
        return this.fetchDocs(constraints)
      })
      const snapshots = await Promise.all(promises)
      return snapshots.flat()
    } catch (err) {
      const message = `[Employee.js fetchByCodes] ドキュメントの取得中にエラーが発生しました: ${err.message}`
      logger.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * Realtime Databaseの`AirGuard/Employees`の内容で、FirestoreのEmployeesドキュメントを更新します。
   * - Realtime Databaseからデータを取得し、そのデータに基づいてFirestore内の
   *   Employeesドキュメントを更新します。
   * - Firestoreの更新はトランザクションを使用して安全に行います。
   * - `docId`が存在しない場合や、データが存在しない場合はエラーが発生します。
   *
   * @param {string} code - Realtime Database内のEmployeesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   ****************************************************************************/
  static async syncFromAirGuard(code) {
    try {
      // Realtime Databaseから Employees データをロード
      const dbRef = database.ref(`AirGuard/Employees/${code}`)
      const data = await dbRef.get()

      // データが存在しない場合はエラーを投げる
      if (!data.exists()) {
        const message = `Realtime Database に同期元の Employees データが見つかりません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      const newData = data.val()
      const docId = newData.docId

      // docIdが存在しない場合はエラーを投げる
      if (!docId) {
        const message = `Employees データに docId が設定されていません。`
        logger.error(`[syncFromAirGuard] ${message}`, { code })
        throw new Error(message)
      }

      // Firestoreドキュメントをトランザクションで同期
      await firestore.runTransaction(async (transaction) => {
        const docRef = firestore.collection('Employees').doc(docId)
        const docSnapshot = await transaction.get(docRef)

        // ドキュメントが存在しない場合はエラーを投げる
        if (!docSnapshot.exists) {
          const message = `Firestore に同期先の Employees ドキュメントが見つかりません。`
          logger.error(`[syncFromAirGuard] ${message}`, { code, docId })
          throw new Error(message)
        }

        // 既存データと新しいデータをマージし、インスタンスを作成
        // AirGuardとの同期設定済みであることを表す `sync` プロパティを true にする
        const instance = new this({
          ...docSnapshot.data(),
          ...newData,
          sync: true,
        })

        // ドキュメントを更新
        transaction.update(docRef, instance.toObject())
      })

      // 同期完了メッセージ
      logger.info(
        `[syncFromAirGuard] Realtime Database の Employees データが Firestore の Employees ドキュメントと正常に同期されました。`,
        { code, docId }
      )
    } catch (err) {
      // エラー処理を一元化し、詳細なログを出力
      logger.error(
        `[syncFromAirGuard] 同期処理でエラーが発生しました: ${err.message}`,
        { code, err }
      )
      throw err
    }
  }

  /****************************************************************************
   * Realtime DatabaseのEmployeesインデックスを更新します。
   * - 指定された `employeeId ` に該当する `Employees` ドキュメントを取得します。
   * - 取得したドキュメントから必要なデータを抽出してインデックスを更新します。
   * - `isDeleted` が true の場合、無条件にインデックスを削除して終了します。
   * @param {string} employeeId - 更新するEmployeesインデックスのドキュメントID
   * @param {boolean} isDeleted - true の場合、インデックスを削除します。
   * @throws {Error} インデックスの更新に失敗した場合、エラーをスローします。
   *
   * @author shisyamo4131
   * @version 1.0.1
   * @updates - version 1.0.1 - 作成するインデックスはデータモデルを使用するように変更
   ****************************************************************************/
  static async syncIndex(employeeId, isDeleted = false) {
    // Create reference to index in Realtime Database.
    const dbRef = database.ref(`Employees/${employeeId}`)

    try {
      // インデックスの削除処理
      if (isDeleted) {
        await dbRef.remove()
        logger.info(`[syncIndex] インデックスが削除されました。`, {
          employeeId,
        })
        return
      }

      // Firestore から Employee ドキュメントを取得
      const docRef = firestore.collection('Employees').doc(employeeId)
      const docSnapshot = await docRef.get()

      // ドキュメントが存在しない場合のエラーハンドリング
      if (!docSnapshot.exists) {
        const message = `該当する Employees ドキュメントが取得できませんでした。`
        logger.error(`[syncIndex] ${message}`, { employeeId })
        throw new Error(message)
      }

      // インデックスデータの作成
      const indexData = new EmployeeIndex(docSnapshot.data())

      // インデックスを更新
      await dbRef.set(indexData)
      logger.info(`[syncIndex] インデックスが更新されました。`, { employeeId })
    } catch (error) {
      // 修正: catchブロックで関数の引数のみをログ出力
      logger.error(
        `[syncIndex] インデックスの同期処理でエラーが発生しました。`,
        { employeeId }
      )
      throw error
    }
  }

  /****************************************************************************
   * 指定された `employeeId` に基づき、`EmployeeContracts` ドキュメントの `site` プロパティを同期します。
   * - `EmployeeContracts` ドキュメントはバッチ処理で同期されます。
   * - `batchLimit` の数でバッチのサイズを指定し、`batchDelay` ミリ秒でバッチごとの遅延を指定します。
   * @param {string} employeeId - 同期対象の Employees ドキュメントの ID
   * @param {Object} [param1] - オプション引数
   * @param {number} [param1.batchLimit=500] - 一度に処理するドキュメントの数
   * @param {number} [param1.batchDelay=100] - バッチごとの遅延時間 (ミリ秒)
   * @returns {Promise<void>}
   ****************************************************************************/
  static async syncToEmployeeContracts(
    employeeId,
    { batchLimit = 500, batchDelay = 100 } = {}
  ) {
    logger.info(
      `[syncToEmployeeContracts] EmployeeContracts ドキュメントの同期処理を開始します。`,
      { employeeId }
    )
    try {
      // Load site document and throw error if the document does not exist.
      const docRef = firestore.collection('Employees').doc(employeeId)

      const docSnapshot = await docRef.get()
      if (!docSnapshot.exists) {
        const message = `指定された Employees ドキュメントが存在しません。`
        logger.error(`[syncToEmployeeContracts] ${message}`, { employeeId })
        throw new Error(message)
      }

      const site = docSnapshot.data()

      // Load EmployeeContracts documents.
      const colRef = firestore.collection('EmployeeContracts')
      const queryRef = colRef.where('employeeId', '==', employeeId)
      const querySnapshot = await queryRef.get()

      // No documents found case
      if (querySnapshot.empty) {
        const message = `同期対象の EmployeeContracts ドキュメントはありませんでした。`
        logger.info(`[syncToEmployeeContracts] ${message}`, { employeeId })
        return
      }

      const docCount = querySnapshot.docs.length
      const message = `${docCount} 件の EmployeeContracts ドキュメントを更新します。`
      logger.info(`[syncToEmployeeContracts] ${message}`, { employeeId })

      // Synchronize EmployeeContracts documents as batch.
      const batchArray = []
      for (let i = 0; i < docCount; i++) {
        if (i % batchLimit === 0) batchArray.push(firestore.batch())
        const currentBatch = batchArray[batchArray.length - 1]
        const doc = querySnapshot.docs[i]
        currentBatch.update(doc.ref, { site })
      }

      // Commit each batch with delay
      for (const batch of batchArray) {
        await batch.commit()
        if (batchDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      logger.info(
        `[syncToEmployeeContracts] EmployeeContracts ドキュメントの同期処理が完了しました。`,
        { employeeId }
      )
    } catch (error) {
      // エラーハンドリングを詳細化
      logger.error(
        `[syncToEmployeeContracts] エラーが発生しました: ${error.message}`,
        { employeeId, error }
      )
      throw error
    }
  }

  /**
   * Firestore の 'Employees' コレクションから指定された期間内に在職していた従業員ドキュメントを返します。
   *
   * @param {Object} options - オプションのフィルタ条件を含むオブジェクト。
   * @param {string | null} options.from - 期間開始日です。
   * @param {string | null} options.to - 期間終了日です。
   * @param {Object|null} options.transaction - 任意のトランザクションオブジェクト。指定がある場合はトランザクション内でクエリを実行します。
   * @returns {Promise<Array<Object>>} Firestore のデータを持つ従業員インスタンスの配列を返します。
   * @throws {Error} Firestore のクエリが失敗した場合、詳細を含むエラーがスローされます。
   */
  async getExistingEmployees({ from, to, transaction = null } = {}) {
    // 引数のチェック
    if (!from || !to) {
      const message = `[getExistingEmployees] 必要な引数が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(`${message}`)
    }

    try {
      // Firestoreの 'Employees' コレクションの参照を取得
      const colRef = firestore.collection('Employees')

      /**
       * 期間中に在籍していた従業員ドキュメントを取得
       * - 条件1) 処理時点で hireDate が to 以前、かつ leaveDate が設定されていない -> 現在在職中で、期間終了日以前に雇い入れられた従業員
       * - 条件2) 処理時点で hireDate が to 以前、かつ leaveDate が from 以降 -> 現在退職済みだが、退職日が期間開始日以降
       * 上記それぞれの条件で取得した ドキュメント を結合すると期間中に在籍していた従業員リストになる。
       */
      // 条件1)
      const activeEmployeesQueryRef = colRef
        .where('hireDate', '<=', to)
        .where('leaveDate', '==', '')
        .withConverter(this.converter())
      const activeEmployeesQuerySnapshot = transaction
        ? await transaction.get(activeEmployeesQueryRef)
        : await activeEmployeesQueryRef.get()
      const activeEmployees = activeEmployeesQuerySnapshot.docs.map((doc) =>
        doc.data()
      )

      // 条件2)
      const leaveEmployeesQueryRef = colRef
        .where('hireDate', '<=', to)
        .where('leaveDate', '>=', from)
        .withConverter(this.converter())
      const leaveEmployeesQuerySnapshot = transaction
        ? await transaction.get(leaveEmployeesQueryRef)
        : await leaveEmployeesQueryRef.get()
      const leaveEmployees = leaveEmployeesQuerySnapshot.docs.map((doc) =>
        doc.data()
      )

      // 結合して返す
      return activeEmployees.concat(leaveEmployees)
    } catch (error) {
      const message = `[getExistingEmployees] 不明なエラーが発生しました。`
      logger.error(message, { from, to, error })
      throw error
    }
  }
}
