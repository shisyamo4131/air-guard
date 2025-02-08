/*****************************************************************************
 * カスタムクラス定義: 従業員 - Employee -
 *
 * @author shisyamo4131
 * @refact 2025-02-08
 *****************************************************************************/
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import {
  createIndex,
  removeIndex,
  syncToFirestoreFromAirGuard,
} from '../modules/database.js'
import FireModel from './FireModel.js'
import { generateProps } from './propsDefinition/propsUtil.js'
const firestore = getFirestore()

/*****************************************************************************
 * クラスで使用する、警備員登録情報のクラス定義
 *****************************************************************************/
class SecurityRegistration {
  constructor(item = {}) {
    this.initialize(item)
  }

  initialize(item = {}) {
    // 警備員登録日
    this.registrationDate = item.registrationDate ?? ''

    // 警備経験開始日
    this.securityStartDate = item.securityStartDate ?? ''

    // ブランク
    this.blankMonths = item.blankMonths ?? 0

    // 本籍地
    this.honseki = item.honseki ?? ''

    // 緊急連絡先氏名
    this.emergencyContactName = item.emergencyContactName ?? ''

    // 緊急連絡先続柄
    this.emergencyContactRelation = item.emergencyContactRelation ?? ''

    // 緊急連絡先続柄詳細
    this.emergencyContactRelationDetail =
      item.emergencyContactRelationDetail ?? ''

    // 緊急連絡先住所
    this.emergencyContactAddress = item.emergencyContactAddress ?? ''

    // 緊急連絡先電話番号
    this.emergencyContactTel = item.emergencyContactTel ?? ''
  }

  toObject() {
    return { ...this }
  }

  // 警備経験年月を返します。
  get experiencePeriod() {
    if (!this.securityStartDate) {
      return { years: 0, months: 0 }
    }

    const startDate = new Date(this.securityStartDate)
    const currentDate = new Date()

    let totalMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12
    totalMonths += currentDate.getMonth() - startDate.getMonth()
    totalMonths -= this.blankMonths

    if (totalMonths < 0) {
      return { years: 0, months: 0 }
    }

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    return { years, months }
  }
}

/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // 従業員code
  code: { type: String, default: '', required: false },

  // 氏
  lastName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 名
  firstName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏名
  fullName: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏カナ
  lastNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 名カナ
  firstNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 氏名カナ
  fullNameKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 略称
  abbr: { type: String, default: '', required: false, requiredByClass: true },

  // 略称カナ
  abbrKana: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 性別
  gender: {
    type: String,
    default: 'male',
    required: false,
    requiredByClass: true,
  },

  // 生年月日（YYYY-MM-DD）
  birth: { type: String, default: '', required: false, requiredByClass: true },

  // 郵便番号
  zipcode: { type: String, default: '', required: false },

  // 住所
  address1: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 建物名・階数
  address2: { type: String, default: '', required: false },

  // 郵送先別住所フラグ
  hasSendAddress: { type: Boolean, default: false, required: false },

  // 郵送先郵便番号
  sendZipcode: { type: String, default: '', required: false },

  // 郵送先住所
  sendAddress1: { type: String, default: '', required: false },

  // 郵送先建物名・階数
  sendAddress2: { type: String, default: '', required: false },

  // 電話番号
  tel: { type: String, default: '', required: false },

  // 携帯番号
  mobile: { type: String, default: '', required: false },

  // 入社年月日（YYYY-MM-DD）
  hireDate: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 退職年月日（YYYY-MM-DD）
  leaveDate: { type: String, default: '', required: false },

  // 退職事由
  leaveReason: { type: String, default: '', required: false },

  // 外国籍フラグ
  isForeigner: { type: Boolean, default: false, required: false },

  // 国籍
  nationality: { type: String, default: '', required: false },

  // 血液型
  bloodType: {
    type: String,
    default: '-',
    required: false,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: { type: String, default: '', required: false },

  // 画像ファイル参照先
  imgRef: { type: String, default: '', required: false },

  // 同期状態
  sync: { type: Boolean, default: false, required: false },

  /**
   * 雇用形態
   * - 配置管理においてアルバイトである従業員のシフト管理を実現するために用意。
   * - 従業員がアルバイトかどうかを判断するために使う。
   * - その他の用途では使用していないし、使用してはいけない。
   */
  contractType: { type: String, default: 'full-time', required: false },

  /**
   * 役職・役割（略称の語尾に付与される）
   * - 配置指示テキスト生成時に必要になる呼称を設定するため
   *   便宜上用意したプロパティ。
   */
  designation: { type: String, default: '', required: false },

  /**
   * 警備員登録情報
   */
  securityRegistration: {
    type: Object,
    default: () => new SecurityRegistration(),
    required: false,
  },

  /**
   * 警備員登録の有無
   */
  hasSecurityRegistration: { type: Boolean, default: false, required: false },
}

const { classProps } = generateProps(propsDefinition)

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Employee extends FireModel {
  // FireModel 設定
  static collectionPath = 'Employees'
  static useAutonumber = true
  static logicalDelete = true
  static classProps = classProps
  static tokenFields = ['lastNameKana', 'firstNameKana', 'abbr', 'abbrKana']
  static hasMany = [
    {
      collection: 'EmployeeContracts',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'MedicalCheckups',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'HealthInsurances',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'Pensions',
      field: 'employeeId',
      condition: '==',
      type: 'collection',
    },
    {
      collection: 'EmploymentInsurances',
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

  // カスタムクラスマップ
  static customClassMap = {
    securityRegistration: SecurityRegistration,
  }

  /**
   * Realtime Databaseの`AirGuard/Employees`の内容で、FirestoreのEmployeesドキュメントを更新します。
   * @param {string} code - Realtime Database内のEmployeesデータを識別するコード
   * @returns {Promise<void>} - 同期が正常に完了した場合は、解決されたPromiseを返します
   */
  static async syncFromAirGuard(code) {
    try {
      const converter = (item) => {
        return {
          ...item,
          isForeigner: item.isForeigner === '1',
          hasSendAddress: item.hasSendAddress === '2',
          hasSecurityRegistration: !!item.registrationDate,
          securityRegistration: {
            // 警備員登録日
            registrationDate: item.registrationDate ?? '',

            // 警備経験開始日
            securityStartDate: item.securityStartDate ?? '',

            // ブランク
            blankMonths: parseInt(item.blankMonths ?? 0),

            // 本籍地
            honseki: item.honseki ?? '',

            // 緊急連絡先氏名
            emergencyContactName: item.emergencyContactName ?? '',

            // 緊急連絡先続柄
            emergencyContactRelation: item.emergencyContactRelation ?? '',

            // 緊急連絡先続柄詳細
            emergencyContactRelationDetail:
              item.emergencyContactRelationDetail ?? '',

            // 緊急連絡先住所
            emergencyContactAddress: item.emergencyContactAddress ?? '',

            // 緊急連絡先電話番号
            emergencyContactTel: item.emergencyContactTel ?? '',
          },
        }
      }
      await syncToFirestoreFromAirGuard(code, 'Employees', this, converter)
    } catch (err) {
      logger.error(err, { code })
      throw err
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
  static async getExistingEmployees({ from, to, transaction = null } = {}) {
    // 引数のチェック
    if (!from || !to) {
      const message = `[getExistingEmployees] 必要な引数が指定されていません。`
      logger.error(message, { from, to })
      throw new Error(`${message}`)
    }

    const instance = new this()

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
        .withConverter(instance.converter())
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
        .withConverter(instance.converter())
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

/*****************************************************************************
 * カスタムクラス - Minimal -
 *****************************************************************************/
export class EmployeeMinimal extends Employee {
  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)
    delete this.tokenMap
    delete this.remarks
    delete this.createAt
    delete this.updateAt
    delete this.uid
  }

  // 更新系メソッドは使用不可
  create() {
    return Promise.reject(new Error('このクラスの create は使用できません。'))
  }

  update() {
    return Promise.reject(new Error('このクラスの update は使用できません。'))
  }

  delete() {
    return Promise.reject(new Error('このクラスの delete は使用できません。'))
  }

  deleteAll() {
    return Promise.reject(
      new Error('このクラスの deleteAll は使用できません。')
    )
  }

  restore() {
    return Promise.reject(new Error('このクラスの restore は使用できません。'))
  }

  static updateImgRef() {
    return Promise.reject(
      new Error('このクラスの updateImgRef は使用できません。')
    )
  }
}

/*****************************************************************************
 * カスタムクラス - Index -
 *****************************************************************************/
export class EmployeeIndex extends EmployeeMinimal {
  // インデックスとして用意するプロパティを定義
  static keepProps = [
    'code',
    'fullName',
    'fullNameKana',
    'abbr',
    'abbrKana',
    'address1',
    'address2',
    'mobile',
    'status',
    'contractType',
    'designation',
    'sync',
    'hasSecurityRegistration',
  ]

  // initialize をオーバーライド
  initialize(item = {}) {
    super.initialize(item)

    // keepProps で定義されたプロパティ以外を削除
    Object.keys(this).forEach((key) => {
      if (!this.constructor.keepProps.includes(key)) delete this[key]
    })
  }

  /**
   * Realtime Database にインデックスを作成します。
   * @param {string} EmployeeId - インデックス作成対象の取引先ID
   */
  static async create(EmployeeId) {
    const functionName = 'create'
    try {
      await createIndex('Employees', EmployeeId, this)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { EmployeeId })
      throw error
    }
  }

  /**
   * Realtime Database からインデックスを削除します。
   * @param {string} customerId - インデックス削除対象の取引先ID
   */
  static async remove(customerId) {
    const functionName = 'remove'
    try {
      await removeIndex('Employees', customerId)
    } catch (error) {
      logger.error(`[${functionName}] ${error.message}`, { customerId })
      throw error
    }
  }
}
