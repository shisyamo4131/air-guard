import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_ARRAY,
  LEAVE_TYPE,
  LEAVE_TYPE_ARRAY,
} from '~/models/constants/attendance-status'
import {
  CUSTOMER_STATUS,
  CUSTOMER_STATUS_ARRAY,
} from '~/models/constants/customer-status'
import { DAY_TYPE, DAY_TYPE_ARRAY } from '~/models/constants/day-types'
import { DEADLINE, DEADLINE_ARRAY } from '~/models/constants/deadlines'
import {
  EMPLOYEE_CONTRACT_TYPE,
  EMPLOYEE_CONTRACT_TYPE_ARRAY,
} from '~/models/constants/employee-contract-types'
import {
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_ARRAY,
} from '~/models/constants/employee-status'
import {
  EQUIPMENT_STATUS,
  EQUIPMENT_STATUS_ARRAY,
} from '~/models/constants/equipment-status'
import { HEALTH_INSURANCE_TYPE } from '~/models/constants/health-insurance-types'
import { MEDICAL_CHECKUP_TYPE } from '~/models/constants/medical-checkup-types'
import {
  OUTSOURCER_STATUS,
  OUTSOURCER_STATUS_ARRAY,
} from '~/models/constants/outsourcer-status'
import {
  PAYMENT_TYPE,
  PAYMENT_TYPE_ARRAY,
} from '~/models/constants/payment-types'
import { SOCIAL_SECURITY_PROCESSING_STATUS } from '~/models/constants/processing-status'
import {
  SECURITY_TYPE,
  SECURITY_TYPE_ARRAY,
} from '~/models/constants/security-types'
import { SITE_STATUS, SITE_STATUS_ARRAY } from '~/models/constants/site-status'
import { WORK_RESULT, WORK_RESULT_ARRAY } from '~/models/constants/work-results'
import { WORK_SHIFT, WORK_SHIFT_ARRAY } from '~/models/constants/work-shifts'

/**
 * 将来適用したいカラーパレット
 * 現行で勝手に変更してしまうと混乱を招きそうなので、一旦こちらに定義
 */
const FUTURE_COLORS = Object.freeze({
  primary: '#1B3B6F', // Deep Blue: 主な基調色として、信頼性と安定感を象徴
  secondary: '#6A994E', // Olive Green: 補助色として自然や調和をイメージ
  accent: '#D1495B', // Burnt Orange: アクセントカラーとして、エネルギッシュで暖かみのある色
  info: '#468FAF', // Teal: 情報をクリアに表現する青緑
  warning: '#D4A373', // Golden Yellow: 注意や警告を促す暖かみのある黄色
  error: '#A63A50', // Brick Red: エラーや危険を示す落ち着いた赤
  success: '#6D597A', // Royal Purple: 成功や高級感を象徴する深い紫
  highlight: '#3E4C59', // Steel Gray: 特定の要素を目立たせるニュートラルなグレー
})

const FUTURE_COLOR_INDEX = (index) => {
  const colorCount = Object.keys(FUTURE_COLORS).length
  const colorIndex = index % colorCount
  return Object.values(FUTURE_COLORS)[colorIndex]
}

const CHAR_REGEXP = {
  全: '[ァ-ンヴー]',
  ア: '[ア-オ]',
  カ: '[カ-ゴ]',
  サ: '[サ-ゾ]',
  タ: '[タ-ド]',
  ナ: '[ナ-ノ]',
  ハ: '[ハ-ポ]',
  マ: '[マ-モ]',
  ヤ: '[ヤ-ヨ]',
  ラ: '[ラ-ロ]',
  ワ: '[ワ-ン]',
}

const CHAR_REGEXP_ARRAY = [
  { text: '全', value: '[ァ-ンヴー]' },
  { text: 'ア', value: '[ア-オ]' },
  { text: 'カ', value: '[カ-ゴ]' },
  { text: 'サ', value: '[サ-ゾ]' },
  { text: 'タ', value: '[タ-ド]' },
  { text: 'ナ', value: '[ナ-ノ]' },
  { text: 'ハ', value: '[ハ-ポ]' },
  { text: 'マ', value: '[マ-モ]' },
  { text: 'ヤ', value: '[ヤ-ヨ]' },
  { text: 'ラ', value: '[ラ-ロ]' },
  { text: 'ワ', value: '[ワ-ン]' },
]

const DAY_DIV = {
  weekdays: '平日',
  saturday: '土曜',
  sunday: '日曜',
  holiday: '祝日',
}

const DAY_DIV_ARRAY = Object.entries(DAY_DIV).map(([key, value]) => ({
  text: value,
  value: key,
}))

const DAY_OF_WEEK_JA = {
  sun: {
    short: '日',
    long: '日曜日',
  },
  mon: {
    short: '月',
    long: '月曜日',
  },
  tue: {
    short: '火',
    long: '火曜日',
  },
  wed: {
    short: '水',
    long: '水曜日',
  },
  thu: {
    short: '木',
    long: '木曜日',
  },
  fri: {
    short: '金',
    long: '金曜日',
  },
  sat: {
    short: '土',
    long: '土曜日',
  },
}

const EDIT_MODE = {
  REGIST: '登録',
  UPDATE: '変更',
  DELETE: '削除',
}

const EDIT_MODE_ARRAY = [
  { text: '登録', value: 'REGIST' },
  { text: '変更', value: 'UPDATE' },
  { text: '削除', value: 'DELETE' },
]

const HEALTH_INSURANCE_TYPE_ARRAY = Object.entries(HEALTH_INSURANCE_TYPE).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)

const LEAVE_APPLICATION_STATUS = {
  approved: '承認',
  unapproved: '未承認',
  rejected: '却下',
  withdraw: '取下',
}

const LEAVE_APPLICATION_STATUS_ARRAY = [
  { value: 'approved', text: '承認' },
  { value: 'unapproved', text: '未承認' },
  { value: 'rejected', text: '却下' },
  { value: 'withdraw', text: '取下' },
]

const LEAVE_APPLICATION_TYPE = {
  'non-paid': '1: 休暇',
  paid: '2: 有給休暇',
}

const LEAVE_APPLICATION_TYPE_ARRAY = [
  { value: 'non-paid', text: '1: 休暇' },
  { value: 'paid', text: '2: 有給休暇' },
]

/**
 * 健康診断受診区分
 */
const MEDICAL_CHECKUP_TYPE_ARRAY = Object.entries(MEDICAL_CHECKUP_TYPE).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)

/**
 * 続柄
 */
const RELATION = {
  spouse: '配偶者',
  parent: '親',
  child: '子',
  brother: '兄弟',
  sister: '姉妹',
  other: 'その他',
}

const RELATION_ARRAY = Object.entries(RELATION).map(([key, value]) => {
  return { value: key, text: value }
})

/**
 * 社会保障手続き状況
 */
const SOCIAL_SECURITY_PROCESSING_STATUS_ARRAY = Object.entries(
  SOCIAL_SECURITY_PROCESSING_STATUS
).map(([key, value]) => {
  return { value: key, text: value }
})

const TEMPORARY_SITE_STATUS = {
  accepted: '受注',
  aborted: '中止',
  canceled: 'キャンセル',
}

const TEMPORARY_SITE_STATUS_ARRAY = [
  { value: 'accepted', text: '受注' },
  { value: 'aborted', text: '中止' },
  { value: 'canceled', text: 'キャンセル' },
]

const TRANSPORTATION_COST_APPLICATION_STATUS = {
  '0:creating': '申請受付前',
  '1:draft': '申請受付中',
  '2:pending': '申請中',
  '3:approved': '承認済み',
  '4:settled': '精算済み',
  '8:rejected': '差し戻し',
  '9:expired': '期限切れ',
}

const TRANSPORTATION_COST_APPLICATION_STATUS_ARRAY = [
  { value: '0:creating', text: '申請受付前' },
  { value: '1:draft', text: '申請受付中' },
  { value: '2:pending', text: '申請中' },
  { value: '3:approved', text: '承認済み' },
  { value: '4:settled', text: '精算済み' },
  { value: '8:rejected', text: '差し戻し' },
  { value: '9:expired', text: '期限切れ' },
]

// const WORK_SHIFT = { day: '日勤', night: '夜勤' }

// const WORK_SHIFT_ARRAY = Object.entries(WORK_SHIFT).map(([key, value]) => {
//   return { value: key, text: value }
// })

export default (context, inject) => {
  inject('FUTURE_COLORS', FUTURE_COLORS)
  inject('FUTURE_COLOR_INDEX', (index) => FUTURE_COLOR_INDEX(index))

  inject('ATTENDANCE_STATUS', ATTENDANCE_STATUS)
  inject('ATTENDANCE_STATUS_ARRAY', ATTENDANCE_STATUS_ARRAY)

  inject('CHAR_REGEXP', CHAR_REGEXP)
  inject('CHAR_REGEXP_ARRAY', CHAR_REGEXP_ARRAY)
  inject('CUSTOMER_STATUS', CUSTOMER_STATUS)
  inject('CUSTOMER_STATUS_ARRAY', CUSTOMER_STATUS_ARRAY)
  inject('DAY_DIV', DAY_DIV)
  inject('DAY_DIV_ARRAY', DAY_DIV_ARRAY)
  inject('DAY_OF_WEEK_JA', DAY_OF_WEEK_JA)
  inject('DAY_TYPE', DAY_TYPE)
  inject('DAY_TYPE_ARRAY', DAY_TYPE_ARRAY)
  inject('DEADLINE', DEADLINE)
  inject('DEADLINE_ARRAY', DEADLINE_ARRAY)
  inject('EDIT_MODE', EDIT_MODE)
  inject('EDIT_MODE_ARRAY', EDIT_MODE_ARRAY)
  inject('EMPLOYEE_CONTRACT_TYPE', EMPLOYEE_CONTRACT_TYPE)
  inject('EMPLOYEE_CONTRACT_TYPE_ARRAY', EMPLOYEE_CONTRACT_TYPE_ARRAY)
  inject('EMPLOYEE_STATUS', EMPLOYEE_STATUS)
  inject('EMPLOYEE_STATUS_ARRAY', EMPLOYEE_STATUS_ARRAY)
  inject('EQUIPMENT_STATUS', EQUIPMENT_STATUS)
  inject('EQUIPMENT_STATUS_ARRAY', EQUIPMENT_STATUS_ARRAY)
  inject('HEALTH_INSURANCE_TYPE', HEALTH_INSURANCE_TYPE)
  inject('HEALTH_INSURANCE_TYPE_ARRAY', HEALTH_INSURANCE_TYPE_ARRAY)
  inject('LEAVE_APPLICATION_STATUS', LEAVE_APPLICATION_STATUS)
  inject('LEAVE_APPLICATION_STATUS_ARRAY', LEAVE_APPLICATION_STATUS_ARRAY)
  inject('LEAVE_APPLICATION_TYPE', LEAVE_APPLICATION_TYPE)
  inject('LEAVE_APPLICATION_TYPE_ARRAY', LEAVE_APPLICATION_TYPE_ARRAY)

  inject('LEAVE_TYPE', LEAVE_TYPE)
  inject('LEAVE_TYPE_ARRAY', LEAVE_TYPE_ARRAY)

  inject('MEDICAL_CHECKUP_TYPE', MEDICAL_CHECKUP_TYPE)
  inject('MEDICAL_CHECKUP_TYPE_ARRAY', MEDICAL_CHECKUP_TYPE_ARRAY)
  inject('OUTSOURCER_STATUS', OUTSOURCER_STATUS)
  inject('OUTSOURCER_STATUS_ARRAY', OUTSOURCER_STATUS_ARRAY)
  inject('PAYMENT_TYPE', PAYMENT_TYPE)
  inject('PAYMENT_TYPE_ARRAY', PAYMENT_TYPE_ARRAY)
  inject('SOCIAL_SECURITY_PROCESSING_STATUS', SOCIAL_SECURITY_PROCESSING_STATUS)
  inject(
    'SOCIAL_SECURITY_PROCESSING_STATUS_ARRAY',
    SOCIAL_SECURITY_PROCESSING_STATUS_ARRAY
  )
  inject('RELATION', RELATION)
  inject('RELATION_ARRAY', RELATION_ARRAY)
  inject('SECURITY_TYPE', SECURITY_TYPE)
  inject('SECURITY_TYPE_ARRAY', SECURITY_TYPE_ARRAY)
  inject('SITE_STATUS', SITE_STATUS)
  inject('SITE_STATUS_ARRAY', SITE_STATUS_ARRAY)
  inject('TEMPORARY_SITE_STATUS', TEMPORARY_SITE_STATUS)
  inject('TEMPORARY_SITE_STATUS_ARRAY', TEMPORARY_SITE_STATUS_ARRAY)
  inject(
    'TRANSPORTATION_COST_APPLICATION_STATUS',
    TRANSPORTATION_COST_APPLICATION_STATUS
  )
  inject(
    'TRANSPORTATION_COST_APPLICATION_STATUS_ARRAY',
    TRANSPORTATION_COST_APPLICATION_STATUS_ARRAY
  )
  inject('WORK_RESULT', WORK_RESULT)
  inject('WORK_RESULT_ARRAY', WORK_RESULT_ARRAY)
  inject('WORK_SHIFT', WORK_SHIFT)
  inject('WORK_SHIFT_ARRAY', WORK_SHIFT_ARRAY)
}
