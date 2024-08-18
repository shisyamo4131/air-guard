/**
 * ## OperationResult.js
 *
 * 稼働実績のデータモデルです。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-08-16 - `Sites`のサブコレクションからコレクションに変更。
 * - version 1.1.0 - 2024-08-09 - `fetchByCode()`を実装。
 *                              - `fetchByCodes()`を実装。
 * - version 1.0.0 - 2024-08-07 - 初版作成
 */
import { collection, getDocs, query, where } from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    code: { type: String, default: '', required: false },
    siteId: { type: String, default: '', required: false },
    site: { type: Object, default: () => ({}), required: false },
    date: { type: String, default: '', required: false },
    dayDiv: {
      type: String,
      default: 'weekday',
      validator: (v) => ['weekday', 'saturday', 'sunday', 'holiday'],
      required: false,
    },
    workShift: {
      type: String,
      default: 'day',
      validator: (v) => ['day', 'night'].includes(v),
      required: false,
    },
    deadline: { type: String, default: '', required: false },
    workers: { type: Array, default: () => [], required: false },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

export default class OperationResult extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'OperationResults'
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  /**
   * 指定されたcodeに該当する稼働実績ドキュメントデータを配列で返します。
   * @param {string} code 稼働実績のcode
   * @returns {Promise<Array>} 稼働実績ドキュメントデータの配列
   */
  async fetchByCode(code) {
    const colRef = collection(this.firestore, 'OperationResults')
    const q = query(colRef, where('code', '==', code))
    const snapshots = await getDocs(q)
    if (snapshots.empty) return []
    return snapshots.docs.map((doc) => doc.data())
  }

  /**
   * 稼働実績のcodeの配列を受け取り、該当する稼働実績ドキュメントデータを配列で返します。
   * 稼働実績のcodeの配列は、重複があれば一意に整理されます。
   * @param {Array<string>} codes
   * @returns {Promise<Array>} 稼働実績ドキュメントデータの配列
   */
  async fetchByCodes(codes) {
    const unique = [...new Set(codes)]
    const chunked = unique.flatMap((_, i) =>
      i % 30 ? [] : [unique.slice(i, i + 30)]
    )
    const colRef = collection(this.firestore, 'OperationResults')
    const snapshots = await Promise.all(
      chunked.map(async (arr) => {
        const q = query(colRef, where('code', 'in', arr))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
    )
    return snapshots.flat()
  }
}
