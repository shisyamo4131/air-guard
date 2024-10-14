import colors from 'vuetify/es5/util/colors'

const ATTENDANCE_STATUS = {}
Object.defineProperties(ATTENDANCE_STATUS, {
  undefined: {
    value: {
      short: '未定',
      toString() {
        return '未定'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  present: {
    value: {
      short: '出勤',
      toString() {
        return '出勤'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  absent: {
    value: {
      short: '欠勤',
      toString() {
        return '欠勤'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  paidLeave: {
    value: {
      short: '有給',
      toString() {
        return '有給休暇'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  substitute: {
    value: {
      short: '振休',
      toString() {
        return '振替休日'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  compOff: {
    value: {
      short: '代休',
      toString() {
        return '代休'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  leave: {
    value: {
      short: '補償休',
      toString() {
        return '補償休暇'
      },
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
})

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

const CONTRACT_TYPE = {
  exective: '0: 役員',
  'full-time': '1: 正社員',
  contract: '2: 契約社員',
  'part-time': '3: アルバイト',
}

const CONTRACT_TYPE_ARRAY = [
  { value: 'exective', text: '0: 役員' },
  { value: 'full-time', text: '1: 正社員' },
  { value: 'contract', text: '2: 契約社員' },
  { value: 'part-time', text: '3: アルバイト' },
]

const CUSTOMER_STATUS = {
  active: '契約中',
  expired: '契約終了',
}

const CUSTOMER_STATUS_ARRAY = [
  { value: 'active', text: '契約中' },
  { value: 'expired', text: '契約終了' },
]

const DAY_OF_WEEK_JA = {
  Sun: {
    short: '日',
    long: '日曜日',
  },
  Mon: {
    short: '月',
    long: '月曜日',
  },
  Tue: {
    short: '火',
    long: '火曜日',
  },
  Wed: {
    short: '水',
    long: '水曜日',
  },
  Thu: {
    short: '木',
    long: '木曜日',
  },
  Fri: {
    short: '金',
    long: '金曜日',
  },
  Sat: {
    short: '土',
    long: '土曜日',
  },
}

const DAY_TYPE = {}
Object.defineProperties(DAY_TYPE, {
  scheduled: {
    value: {
      short: '所定',
      toString() {
        return '所定労働日'
      },
      color: colors.blue.lighten2,
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  'non-statutory-holiday': {
    value: {
      short: '法定外',
      toString() {
        return '法定外休日'
      },
      color: colors.green.lighten2,
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  'legal-holiday': {
    value: {
      short: '法定休',
      toString() {
        return '法定休日'
      },
      color: colors.red.lighten2,
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
  undefined: {
    value: {
      short: '不明',
      toString() {
        return '不明'
      },
      color: colors.grey.darken1,
    },
    writable: false,
    configurable: false,
    enumerable: true,
  },
})

const DAY_TYPE_ARRAY = [
  { text: '所定労働日', value: 'scheduled' },
  { text: '法定外休日', value: 'non-statutory-holiday' },
  { text: '法定休日', value: 'legal-holiday' },
  { text: '不明', value: 'undefined' },
]

const DEADLINE = {
  '05': '5日',
  10: '10日',
  15: '15日',
  20: '20日',
  25: '25日',
  99: '末日',
}

const DEADLINE_ARRAY = [
  { text: '5日', value: '05' },
  { text: '10日', value: '10' },
  { text: '15日', value: '15' },
  { text: '20日', value: '20' },
  { text: '25日', value: '25' },
  { text: '末日', value: '99' },
]

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

const EMPLOYEE_CONTRACT_TYPE = {
  'part-time': 'アルバイト',
  contract: '契約社員',
  'full-time': '正社員',
}

const EMPLOYEE_CONTRACT_TYPE_ARRAY = [
  { value: 'part-time', text: 'アルバイト' },
  { value: 'contract', text: '契約社員' },
  { value: 'full-time', text: '正社員' },
]

const EMPLOYEE_STATUS = {
  active: '在籍',
  expired: '退職',
}

const EMPLOYEE_STATUS_ARRAY = [
  { value: 'active', text: '在籍' },
  { value: 'expired', text: '退職' },
]

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

const OUTSOURCER_STATUS = {
  active: '契約中',
  expired: '契約終了',
}

const OUTSOURCER_STATUS_ARRAY = [
  { value: 'active', text: '契約中' },
  { value: 'expired', text: '契約終了' },
]

const SECURITY_TYPE = {
  'newly-training': '新任教育',
  traffic: '交通誘導警備',
  jam: '雑踏警備',
  facility: '施設警備',
  patrol: '巡回警備',
  other: 'その他',
}

const SECURITY_TYPE_ARRAY = [
  { value: 'newly-training', text: '新任教育' },
  { value: 'traffic', text: '交通誘導警備' },
  { value: 'jam', text: '雑踏警備' },
  { value: 'facility', text: '施設警備' },
  { value: 'patrol', text: '巡回警備' },
  { value: 'other', text: 'その他' },
]

const SITE_STATUS = {
  active: '稼働中',
  expired: '終了',
}

const SITE_STATUS_ARRAY = [
  { value: 'active', text: '稼働中' },
  { value: 'expired', text: '終了' },
]

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

const WORK_SHIFT = {
  day: '日勤',
  night: '夜勤',
  else: 'その他',
}

const WORK_SHIFT_ARRAY = [
  { value: 'day', text: '日勤' },
  { value: 'night', text: '夜勤' },
  { value: 'else', text: 'その他' },
]

export default (context, inject) => {
  inject('ATTENDANCE_STATUS', ATTENDANCE_STATUS)
  inject('CHAR_REGEXP', CHAR_REGEXP)
  inject('CHAR_REGEXP_ARRAY', CHAR_REGEXP_ARRAY)
  inject('CONTRACT_TYPE', CONTRACT_TYPE)
  inject('CONTRACT_TYPE_ARRAY', CONTRACT_TYPE_ARRAY)
  inject('CUSTOMER_STATUS', CUSTOMER_STATUS)
  inject('CUSTOMER_STATUS_ARRAY', CUSTOMER_STATUS_ARRAY)
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
  inject('LEAVE_APPLICATION_STATUS', LEAVE_APPLICATION_STATUS)
  inject('LEAVE_APPLICATION_STATUS_ARRAY', LEAVE_APPLICATION_STATUS_ARRAY)
  inject('LEAVE_APPLICATION_TYPE', LEAVE_APPLICATION_TYPE)
  inject('LEAVE_APPLICATION_TYPE_ARRAY', LEAVE_APPLICATION_TYPE_ARRAY)
  inject('OUTSOURCER_STATUS', OUTSOURCER_STATUS)
  inject('OUTSOURCER_STATUS_ARRAY', OUTSOURCER_STATUS_ARRAY)
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
  inject('WORK_SHIFT', WORK_SHIFT)
  inject('WORK_SHIFT_ARRAY', WORK_SHIFT_ARRAY)
}
