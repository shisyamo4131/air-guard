/**
 * ### SiteContract.js
 *
 * 現場の取極めデータモデルです。
 *
 * #### 機能詳細:
 * - 現場、開始日付、勤務区分ごとに管理します。
 * - `docId`は`${startDate}-${workShift}`に固定されます。
 *
 * #### 注意事項:
 * - `startDate`と`workShift`がドキュメントのkeyになるため、変更してはいけません。
 *
 * @author shisyamo4131
 * @version 1.1.0
 *
 * @updates
 * - version 1.1.0 - 2024-08-09 - `fetchBySiteId()`を実装。
 *                              - `fetchBySiteIds()`を実装。
 * - version 1.0.0 - 2024-07-12 - 初版作成
 */
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import FireModel from './FireModel'
const props = {
  props: {
    docId: { type: String, default: '', required: false },
    siteId: { type: String, default: '', required: false },
    startDate: { type: String, default: '', required: false },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    startTime: { type: String, default: '', required: false },
    endTime: { type: String, default: '', required: false },
    endTimeNextday: { type: Boolean, default: false, required: false },
    breakMinutes: { type: Number, default: 60, required: false },
    unitPrices: {
      type: Object,
      default: () => {
        return {
          weekdays: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          saturday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          sunday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
          holiday: {
            standard: { price: 0, overtime: 0 },
            qualified: { price: 0, overtime: 0 },
          },
        }
      },
    },
    halfRate: { type: Number, default: 50, required: false },
    cancelRate: { type: Number, default: 100, required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

export default class SiteContract extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    Object.defineProperties(this, {
      workTime: {
        enumerable: true,
        get() {
          if (!this.startDate) return 0
          if (!this.startTime || !this.endTime) return 0
          const start = new Date(`${this.startDate} ${this.startTime}`)
          const end = new Date(`${this.startDate} ${this.endTime}`)
          if (this.endTimeNextday) end.setDate(end.getDate() + 1)
          const diff = (end.getTime() - start.getTime()) / 60 / 1000
          return diff - (this.breakMinutes || 0)
        },
        set(v) {},
      },
    })
  }

  get collection() {
    return `Sites/${this.siteId}/SiteContracts`
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

  /**
   * 同一の開始日付、勤務区分での取極めが存在する場合は作成不可です。
   */
  async beforeCreate() {
    if (await this.isExist()) {
      const errMsg = '同一日、同一勤務区分の取極めが既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
  }

  /**
   * `docId`を`${startDate}-${workShift}`に固定します。
   */
  async create() {
    const docId = `${this.startDate}-${this.workShift}`
    await super.create({ docId })
  }

  /**
   * 指定された開始日、勤務区分での取極めが存在するかどうかを返します。
   */
  async isExist() {
    const path = `${this.collection}/${this.startDate}-${this.workShift}`
    const docRef = doc(this.firestore, path)
    const snapshot = await getDoc(docRef)
    return snapshot.exists()
  }

  /**
   * 指定された現場の取極めデータを取得して配列で返します。
   * @param {string} siteId 現場のドキュメントid
   * @returns {Promise<Array>} 取極めドキュメントデータの配列
   */
  async fetchBySiteId(siteId) {
    const colRef = collectionGroup(this.firestore, 'SiteContracts')
    const q = query(colRef, where('siteId', '==', siteId))
    const snapshots = await getDocs(q)
    if (snapshots.empty) return []
    return snapshots.docs.map((doc) => doc.data())
  }

  /**
   * 現場のドキュメントidの配列を受け取り、該当する取極めドキュメントデータを配列で返します。
   * 現場のドキュメントidの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} ids
   * @returns {Promise<Array>} 取極めドキュメントデータの配列
   */
  async fetchBySiteIds(ids) {
    const unique = [...new Set(ids)]
    const chunked = unique.flatMap((_, i) =>
      i % 30 ? [] : [unique.slice(i, i + 30)]
    )
    const colRef = collectionGroup(this.firestore, 'SiteContracts')
    const snapshots = await Promise.all(
      chunked.map(async (arr) => {
        const q = query(colRef, where('siteId', 'in', arr))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
    )
    return snapshots.flat()
  }
}
