/**
 * 従業員ドキュメント定義
 * @author shisyamo4131
 * @refact 2025-01-30
 */
import { EMPLOYEE_CONTRACT_TYPE } from '../constants/employee-contract-types'
import { EMPLOYEE_STATUS } from '../constants/employee-status'
import { generateVueProps, generateClassProps } from './propsUtil'

/*****************************************************************************
 * [CLASS] SecurityRegistration
 * Employee クラスで使用する、警備員登録情報のオブジェクト定義です。
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

  /**
   * 警備経験年月を返します。
   */
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
    validator: (v) => ['male', 'female'].includes(v),
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
    validator: (v) => ['A', 'B', 'O', 'AB', '-'].includes(v),
    required: false,
  },

  // 状態
  status: {
    type: String,
    default: 'active',
    required: false,
    validator: (v) => Object.keys(EMPLOYEE_STATUS).includes(v),
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
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) => Object.keys(EMPLOYEE_CONTRACT_TYPE).includes(v),
  },

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

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
/**
 * lastName, firstName から氏名を生成して返します。
 */
const fullName = {
  configurable: true,
  enumerable: true,
  get() {
    if (!this.lastName || !this.firstName) return ''
    return `${this.lastName} ${this.firstName}`
  },
  set(v) {},
}

/**
 * lastNameKana, firstNameKana から氏名カナを生成して返します。
 */
const fullNameKana = {
  configurable: true,
  enumerable: true,
  get() {
    if (!this.lastNameKana || !this.firstNameKana) return ''
    return `${this.lastNameKana} ${this.firstNameKana}`
  },
  set(v) {},
}

/**
 * 警備員登録の有無を警備員登録情報の登録状況から判断します。
 * - 警備員登録情報の registrationDate プロパティを参照します。
 */
const hasSecurityRegistration = {
  configurable: true,
  enumerable: true,
  get() {
    return !!this.securityRegistration.registrationDate
  },
  set(v) {},
}

const accessor = { fullName, fullNameKana, hasSecurityRegistration }

export { vueProps, classProps, accessor, SecurityRegistration }
