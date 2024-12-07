import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  docId: { type: String, default: '', required: false, requiredByClass: false },

  // 複製元のドキュメントID
  sourceDocId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 年（YYYY）
  year: { type: String, default: '', required: false, requiredByClass: true },

  // 就業規則名
  name: { type: String, default: '', required: false, requiredByClass: true },

  // 雇用形態
  contractType: {
    type: String,
    default: 'full-time',
    validator: (v) =>
      ['exective', 'full-time', 'contract', 'part-time'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 所定労働日
  scheduledWorkDays: {
    type: Array,
    default: () => ['mon', 'tue', 'wed', 'thu', 'fri'],
    required: false,
    requiredByClass: true,
  },

  // 所定労働時間（分）
  scheduledWorkMinutes: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 法定休日
  legalHoliday: {
    type: String,
    default: 'sun',
    validator: (v) =>
      !v || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(v),
    required: false,
    requiredByClass: true,
  },

  // 祝日を所定労働日とするか
  isHolidayWorkDay: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  // 始業時刻
  startTime: {
    type: String,
    default: '08:00',
    required: false,
    requiredByClass: true,
  },

  // 終業時刻
  endTime: {
    type: String,
    default: '17:00',
    required: false,
    requiredByClass: true,
  },

  // 休憩時間（分）
  breakMinutes: {
    type: Number,
    default: 60,
    required: false,
    requiredByClass: true,
  },

  // 所定時間外労働の有無
  hasOvertime: {
    type: Boolean,
    default: false,
    required: false,
    requiredByClass: true,
  },

  // 備考
  remarks: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // 時間外割増率
  overtimePayRate: {
    type: Number,
    default: 25,
    required: false,
    requiredByClass: true,
  },

  // 休日労働割増率
  holidayPayRate: {
    type: Number,
    default: 35,
    required: false,
    requiredByClass: true,
  },

  // 賞与支給
  bonusEligibility: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: false,
  },

  // 月平均所定労働日数
  averageMonthlyScheduledWorkDays: {
    type: Number,
    default: null,
    required: false,
    requiredByClass: true,
  },

  // 祝日（当該就業規則に適用する祝日）
  holidays: {
    type: Array,
    default: () => [],
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 就業場所（雇い入れ直後）
  initialWorkLocation: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 就業場所（変更の範囲）
  locationChangeScope: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 従事すべき業務の内容（雇い入れ直後）
  initialJob: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },

  // [労働条件通知書] 従事すべき業務の内容（変更の範囲）
  jobChangeScope: {
    type: String,
    default: '',
    required: false,
    requiredByClass: false,
  },
}

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
