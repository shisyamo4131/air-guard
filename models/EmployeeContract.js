/**
 * ### EmployeeContract.js
 *
 * 従業員の雇用契約データモデルです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 */

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    employeeId: { type: String, default: '', required: false },
    startDate: { type: String, default: '', required: false },
    hasPeriod: { type: Boolean, default: true, required: false },
    expiredDate: { type: String, default: '', required: false },
    contractType: {
      type: String,
      default: 'part-time',
      validator: (v) => ['part-time', 'contract', 'full-time'],
      required: false,
    },
    startTime: { type: String, default: '08:00', required: false },
    endTime: { type: String, default: '17:00', required: false },
    breakMinutes: { type: Number, default: 60, required: false },
    paymentType: {
      type: String,
      default: 'daily',
      validator: (v) => ['dayly', 'monthly'],
    },
    basicWage: { type: Number, default: null, required: false },
    scheduledWorkDays: { type: Array, default: () => [], required: false },
    isHolidayWorkDay: { type: Boolean, default: true, required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }
