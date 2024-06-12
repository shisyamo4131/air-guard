import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    month: { type: String, default: '', required: false },
    scheduledWorkingTime: { type: Number, default: null, required: false },
    statutoryOverTime: { type: Number, default: null, required: false },
    nonStatutoryOverTime: { type: Number, default: null, required: false },
    holidayWorkingTime: { type: Number, default: null, required: false },
    midnightWorkingTime: { type: Number, default: null, required: false },
    scheduledWorkingDays: { type: Number, default: null, required: false },
    statutoryWorkingDays: { type: Number, default: null, required: false },
    holidayWorkingDays: { type: Number, default: null, required: false },
    absenceDays: { type: Number, default: null, required: false },
    annualVacationDays: { type: Number, default: null, required: false },
  },
}
export { props }

/**
 * ## AttendanceRecord
 * @author shisyamo4131
 */
export default class AttendanceRecord extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'AttendanceRecords'
    Object.defineProperties(this, {
      overTimeTotal: {
        enumerable: true,
        get() {
          return this.nonStatutoryOverTime + this.holidayWorkingTime
        },
        set(v) {},
      },
    })
  }

  initialize(item) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  async create() {
    await super.create(this.employeeId + this.month)
  }

  async importFromAirGuard(data) {
    /* Delete all documents. */
    const delAll = async () => {
      const colRef = collection(this.firestore, this.collection)
      const snapshot = await getDocs(colRef)
      const batchArray = []
      snapshot.docs.forEach((doc, index) => {
        if (index % 500 === 0) batchArray.push(writeBatch(this.firestore))
        batchArray[batchArray.length - 1].delete(doc.ref)
      })
      await Promise.all(batchArray.map((batch) => batch.commit()))
    }
    await delAll()
    /* Get employee data. */
    const getEmployees = async (chuncked) => {
      const promises = chuncked.map(async (codes) => {
        const colRef = collection(this.firestore, 'Employees')
        const q = query(colRef, where('code', 'in', codes))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
      const snapshots = await Promise.all(promises)
      const result = []
      snapshots.forEach((data) => result.push(...data))
      return result
    }
    const employeeCodes = data.map(({ employeeId }) => employeeId)
    const uniqueCodes = [...new Set(employeeCodes)]
    const chuncked = uniqueCodes.flatMap((_, i) =>
      i % 30 ? [] : [uniqueCodes.slice(i, i + 30)]
    )
    const employees = await getEmployees(chuncked)
    const newItems = data.map((item) => {
      item.employeeId = employees.find(
        ({ code }) => code === item.employeeId
      ).docId
      item.scheduledWorkingTime = parseInt(item.scheduledWorkingTime)
      item.statutoryOverTime = parseInt(item.statutoryOverTime)
      item.nonStatutoryOverTime = parseInt(item.nonStatutoryOverTime)
      item.holidayWorkingTime = parseInt(item.holidayWorkingTime)
      item.midnightWorkingTime = parseInt(item.midnightWorkingTime)
      item.scheduledWorkingDays = parseInt(item.scheduledWorkingDays)
      item.statutoryWorkingDays = parseInt(item.statutoryWorkingDays)
      item.holidayWorkingDays = parseInt(item.holidayWorkingDays)
      item.absenceDays = parseInt(item.absenceDays)
      item.annualVacationDays = parseInt(item.annualVacationDays)
      return item
    })
    const batchArray = []
    newItems.forEach((item, index) => {
      this.initialize(item)
      this.createAt = this.dateUtc.getTime()
      this.createDate = this.dateJst.toLocaleString()
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.auth.currentUser.uid
      if (index % 500 === 0) batchArray.push(writeBatch(this.firestore))
      const docId = this.employeeId + this.month
      const docRef = doc(this.firestore, `AttendanceRecords/${docId}`)
      batchArray[batchArray.length - 1].set(docRef, {
        ...structuredClone(this),
      })
    })
    await Promise.all(batchArray.map((batch) => batch.commit()))
  }
}
