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

const CUSTOMER_STATUS = {
  active: '契約中',
  expired: '契約終了',
}

const CUSTOMER_STATUS_ARRAY = [
  { value: 'active', text: '契約中' },
  { value: 'expired', text: '契約終了' },
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
  reject: '却下',
}

const LEAVE_APPLICATION_STATUS_ARRAY = [
  { value: 'approved', text: '承認' },
  { value: 'unapproved', text: '未承認' },
  { value: 'reject', text: '却下' },
]

const LEAVE_APPLICATION_TYPE = {
  'non-paid': '1: 休暇',
  paid: '2: 有給休暇',
}

const LEAVE_APPLICATION_TYPE_ARRAY = [
  { value: 'non-paid', text: '1: 休暇' },
  { value: 'paid', text: '2: 有給休暇' },
]

const SITE_STATUS = {
  active: '稼働中',
  expired: '終了',
}

const SITE_STATUS_ARRAY = [
  { value: 'active', text: '稼働中' },
  { value: 'expired', text: '終了' },
]

const WORK_SHIFT = {
  day: '日勤',
  night: '夜勤',
}

const WORK_SHIFT_ARRAY = [
  { value: 'day', text: '日勤' },
  { value: 'night', text: '夜勤' },
]

export default (context, inject) => {
  inject('CHAR_REGEXP', CHAR_REGEXP)
  inject('CHAR_REGEXP_ARRAY', CHAR_REGEXP_ARRAY)
  inject('CUSTOMER_STATUS', CUSTOMER_STATUS)
  inject('CUSTOMER_STATUS_ARRAY', CUSTOMER_STATUS_ARRAY)
  inject('EMPLOYEE_STATUS', EMPLOYEE_STATUS)
  inject('EMPLOYEE_STATUS_ARRAY', EMPLOYEE_STATUS_ARRAY)
  inject('LEAVE_APPLICATION_STATUS', LEAVE_APPLICATION_STATUS)
  inject('LEAVE_APPLICATION_STATUS_ARRAY', LEAVE_APPLICATION_STATUS_ARRAY)
  inject('LEAVE_APPLICATION_TYPE', LEAVE_APPLICATION_TYPE)
  inject('LEAVE_APPLICATION_TYPE_ARRAY', LEAVE_APPLICATION_TYPE_ARRAY)
  inject('SITE_STATUS', SITE_STATUS)
  inject('SITE_STATUS_ARRAY', SITE_STATUS_ARRAY)
  inject('WORK_SHIFT', WORK_SHIFT)
  inject('WORK_SHIFT_ARRAY', WORK_SHIFT_ARRAY)
}
