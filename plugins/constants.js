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
