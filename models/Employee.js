import { FireModel, firestore } from 'air-firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { classProps } from './propsDefinition/Employee'
import EmployeeContract from './EmployeeContract'

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
  #EmployeeContractInstance = new EmployeeContract()
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
      field: 'employeeId',
      condition: 'array-contains',
      type: 'collection',
    },
  ]

  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item)
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
   * 指定されたドキュメントIDのimgRefを更新します。
   * - ドキュメントIDとURLを受け取り、該当ドキュメントのimgRefを更新します。
   *
   * @param {string} docId - 更新対象の従業員ドキュメントのID
   * @param {string} url - 更新するimgRefのURL
   * @throws {Error} ドキュメントIDまたはURLが無効な場合、あるいはドキュメントが存在しない場合にエラーをスロー
   ****************************************************************************/
  static async updateImgRef(docId, url) {
    // クラス名を取得
    const className = this.name

    // docIdが無効でないかチェック
    if (!docId || typeof docId !== 'string') {
      throw new Error(
        `[${className} - updateImgRef]: A valid document ID must be provided.`
      )
    }

    // urlが無効でないかチェック
    if (!url || typeof url !== 'string') {
      throw new Error(
        `[${className} - updateImgRef]: A valid URL must be provided.`
      )
    }

    try {
      // インスタンスを生成し、ドキュメントを取得
      const instance = new this()

      // ドキュメントが存在するか確認
      const docExists = await instance.fetch(docId)
      if (!docExists) {
        throw new Error(
          `[${className} - updateImgRef]: Document not found in Employees collection. Document ID: ${docId}`
        )
      }

      // imgRefを更新
      instance.imgRef = url

      // ドキュメントを更新
      await instance.update()

      // eslint-disable-next-line no-console
      console.info(
        `[${className} - updateImgRef]: Successfully updated imgRef for document ID: ${docId}`
      )
    } catch (error) {
      // エラーメッセージの整形と出力
      const message = `[${className} - updateImgRef]: Failed to update imgRef for document ID: ${docId}. Error: ${error.message}`
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
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
      // eslint-disable-next-line no-console
      console.error(message)
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
      // eslint-disable-next-line no-console
      console.error(message)
      throw new Error(message)
    }
  }

  /****************************************************************************
   * 従業員の雇用契約情報に対して、Firestoreコレクションのリアルタイムリスナーを設定します。
   * - EmployeeContractクラスを使用し、該当従業員の契約情報に対するリアルタイム監視を開始します。
   * - docIdが設定されていない場合、エラーメッセージを出力して処理を中断します。
   *
   * @returns {Array<Object>|undefined} リアルタイムで監視している契約情報のデータ
   ****************************************************************************/
  subscribeContracts() {
    // docIdが設定されているか確認
    if (!this.docId) {
      // eslint-disable-next-line no-console
      console.error(
        `[${this.constructor.name} - subscribeContracts]: docId is not set.`
      )
      return // docIdが未設定の場合、処理を中断
    }

    // EmployeeContractクラスを使用して、該当する従業員の契約情報に対するリアルタイムリスナーを設定
    return this.#EmployeeContractInstance.subscribeDocs([
      ['where', 'employeeId', '==', this.docId], // employeeIdを条件にしたクエリを実行
    ])
  }

  /****************************************************************************
   * 従業員の雇用契約情報に対するリアルタイムリスナーを解除します。
   * - EmployeeContractクラスで設定されているFirestoreのリアルタイムリスナーを解除します。
   ****************************************************************************/
  unsubscribeContracts() {
    if (this.#EmployeeContractInstance) {
      this.#EmployeeContractInstance.unsubscribe()
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[${this.constructor.name} - unsubscribeContracts]: No active listener found.`
      )
    }
  }

  /**
   * Retrieves all active employees from the Firestore 'Employees' collection.
   * - Optionally filters employees based on a provided hire date.
   *
   * This function queries the Firestore database to fetch all employees whose
   * status is marked as 'active'. If a hireDate is provided, the function will
   * further filter the employees to only include those whose hire date is on or
   * before the provided date.
   *
   * @param {Object} options - An object containing the optional filter criteria.
   * @param {Date | null} options.hireDate - The hire date filter; only employees hired on or before this date will be retrieved.
   * @returns {Promise<Array<Object>>} An array of employee instances, each populated with Firestore data.
   * @throws {Error} If the Firestore query fails, an error will be thrown with details of the failure.
   */
  static async getExistingEmployees({ hireDate = null } = {}) {
    try {
      // Firestoreの 'Employees' コレクションの参照を取得
      const colRef = collection(firestore, 'Employees')

      // フィルタリングするクエリを作成
      const wheres = [where('status', '==', 'active')]
      if (hireDate) {
        wheres.push(where('hireDate', '<=', hireDate))
      }
      const q = query(colRef, ...wheres)

      // Firestoreからクエリ結果を取得
      const querySnapshot = await getDocs(q)

      // 取得した従業員データをクラスのインスタンスに変換して返す
      // doc.data() で各ドキュメントのデータを取得し、new this() で新しいインスタンスを生成
      return querySnapshot.docs.map((doc) => new this(doc.data()))
    } catch (error) {
      // クエリの実行中にエラーが発生した場合のエラーログ出力
      // eslint-disable-next-line no-console
      console.error('Failed to fetch existing employees:', {
        errorMessage: error.message, // エラーメッセージを含む
        hireDate, // クエリ時に使用した hireDate の値も含める
      })

      // エラーメッセージを含めて新しいエラーをスロー
      throw new Error('Failed to fetch existing employees: ' + error.message)
    }
  }
}
