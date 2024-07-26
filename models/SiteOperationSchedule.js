/**
 * ### SiteOperationSchedule.js
 *
 * #### 概要
 * 現場の稼働予定を管理するためのモデルクラスです。
 *
 * #### 機能詳細:
 * - 稼働予定としてカレンダーで頻繁に表示されることを想定して、`event`プロパティを定義しています。
 * - 同一日、同一勤務区分でのドキュメントは作成できません。（keyにはsiteIdを含みますが、サブコレクションなので日付と勤務区分でのValidationです）
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.1.0 - 2024-07-26 - ドキュメントidを`siteId` + `date` + `workShift`に固定。
 *                              - `props.dates`を追加 -> `SiteOperationScheduleBulk`で使用するため。
 * - version 1.0.0 - 2024-07-12 - 初版作成
 */

import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    /**
     * `SiteOperationScheduleBulk`で使用します。
     */
    dates: { type: Array, default: () => [], required: false },
    siteId: { type: String, default: '', required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    start: { type: String, default: '', required: false },
    end: { type: String, default: '', required: false },
    requiredWorkers: { type: Number, default: null, required: false },
    qualification: { type: Boolean, default: false, required: false },
    workers: { type: Array, default: () => [], required: false },
    outsourcers: { type: Array, default: () => [], required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

export default class SiteOperationSchedule extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.tokenFields = []
    Object.defineProperties(this, {
      /**
       * VCalendarコンポーネントで容易に使用できるよう、eventプロパティを定義。
       */
      event: {
        enumerable: true,
        get() {
          return {
            name: this.siteId,
            date: this.date,
            workShift: this.workShift,
            requiredWorkers: this.requiredWorkers,
            start: this.start,
            color: this.workShift === 'day' ? 'blue' : 'red',
          }
        },
        set(v) {},
      },
    })
  }

  get collection() {
    return `Sites/${this.siteId}/SiteOperationSchedules`
  }

  set collection(v) {}

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  async beforeCreate() {
    const colRef = collection(this.firestore, this.collection)
    const q = query(
      colRef,
      where('date', '==', this.date),
      where('workShift', '==', this.workShift),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const errMsg = '同一日、同一勤務区分の稼働予定が既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
  }

  async beforeUpdate() {
    const colRef = collection(this.firestore, this.collection)
    const q = query(
      colRef,
      where('docId', '!=', this.docId),
      where('date', '==', this.date),
      where('workShift', '==', this.workShift),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty && querySnapshot.docs[0].id !== this.docId) {
      const errMsg = '同一日、同一勤務区分の稼働予定が既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
  }

  async create() {
    const docId = `${this.siteId}-${this.date}-${this.workShift}`
    await super.create({ docId })
  }
}
