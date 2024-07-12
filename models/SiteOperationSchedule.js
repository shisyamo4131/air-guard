/**
 * ### SiteOperationSchedule.js
 *
 * #### 概要
 * 現場の稼働予定を管理するためのモデルクラスです。
 *
 * #### 機能詳細:
 * - 稼働予定としてカレンダーで頻繁に表示されることを想定して、`event`プロパティを定義しています。
 *
 * @updates
 * - version 1.0.0 - 2024-07-12 - 初版作成
 *
 * @version 1.0.0
 * @author shisyamo4131
 */

import {
  collection,
  // doc,
  // getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    docId: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
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
  // #fetchedSites = []
  constructor(context, item = {}) {
    super(context, item)
    this.tokenFields = []
    Object.defineProperties(this, {
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
    if (!querySnapshot.empty) {
      const errMsg = '同一日、同一勤務区分の稼働予定が既に登録されています。'
      // eslint-disable-next-line
      console.error(errMsg)
      throw new Error(errMsg)
    }
  }

  /**
   * コレクションへのリアルタイムリスナーを開始します。
   * 参照として返される配列にはカレンダー用のイベントに変換されたオブジェクトです。
   * @param {string} from - 取得する日付範囲の開始日
   * @param {*} to - 取得する日付範囲の最終日
   * @param {*} temporary - trueにするとスポット現場の稼働予定のみを取得
   * @returns 取得したドキュメントデータをカレンダー用のイベントに変換したオブジェクトが格納されている配列への参照
   */
  // subscribeAsEvent(
  //   { from, to } = {
  //     from: undefined,
  //     to: undefined,
  //   }
  // ) {
  //   const constraints = [where('date', '>=', from), where('date', '<=', to)]
  //   const items = super.subscribe(
  //     undefined,
  //     constraints,
  //     this.convertToEvent.bind(this)
  //   )
  //   return items
  // }

  /**
   * コレクショングループへのリアルタイムリスナーを開始します。
   * 参照として返される配列にはカレンダー用のイベントに変換されたオブジェクトです。
   * @param {string} from - 取得する日付範囲の開始日
   * @param {string} to - 取得する日付範囲の最終日
   * @param {boolean} temporary - trueにするとスポット現場の稼働予定のみを取得
   * @returns 取得したドキュメントデータをカレンダー用のイベントに変換したオブジェクトが格納されている配列への参照
   */
  // subscribeGroupAsEvent(
  //   { from, to } = {
  //     from: undefined,
  //     to: undefined,
  //   }
  // ) {
  //   const constraints = [where('date', '>=', from), where('date', '<=', to)]
  //   const items = super.subscribeGroup(
  //     undefined,
  //     constraints,
  //     this.convertToEvent.bind(this)
  //   )
  //   return items
  // }

  // async convertToEvent(data) {
  //   const getSite = async (siteId) => {
  //     const site = this.#fetchedSites.find(({ docId }) => docId === siteId)
  //     if (site) return site
  //     const docRef = doc(this.firestore, `Sites/${siteId}`)
  //     const snapshot = await getDoc(docRef)
  //     if (!snapshot.exists()) {
  //       const errMsg = `Could not find site document. id: ${siteId}`
  //       // eslint-disable-next-line
  //       console.error(errMsg)
  //       throw new Error(errMsg)
  //     }
  //     this.#fetchedSites.push(snapshot.data())
  //     return snapshot.data()
  //   }
  //   const site = await getSite(data.siteId)
  //   return {
  //     name: site.name,
  //     date: data.date,
  //     workShift: data.workShift,
  //     requiredWorkers: data.requiredWorkers,
  //     start: data.start,
  //     color: data.workShift === 'day' ? 'blue' : 'red',
  //     site,
  //     schedule: data,
  //   }
  // }
}
