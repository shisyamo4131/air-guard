const APPLICATION_TYPE = {
  vacation: '1: 休暇',
  paid: '2: 有給休暇',
}

const APPLICATION_TYPE_ARRAY = [
  { value: 'vacation', text: '1: 休暇' },
  { value: 'paid', text: '2: 有給休暇' },
]

const APPLICATION_STATUS = {
  approved: '承認',
  unapproved: '未承認',
  reject: '却下',
}

const APPLICATION_STATUS_ARRAY = [
  { value: 'approved', text: '承認' },
  { value: 'unapproved', text: '未承認' },
  { value: 'reject', text: '却下' },
]

export default (context, inject) => {
  inject('APPLICATION_STATUS', APPLICATION_STATUS)
  inject('APPLICATION_STATUS_ARRAY', APPLICATION_STATUS_ARRAY)
  inject('APPLICATION_TYPE', APPLICATION_TYPE)
  inject('APPLICATION_TYPE_ARRAY', APPLICATION_TYPE_ARRAY)
}
