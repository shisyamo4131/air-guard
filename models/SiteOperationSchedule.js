/**
 * SiteOperationSchedule.js
 * @version 1.0.0
 * @date 2024-06-20
 * @autor shisyamo4131
 *
 * 概要:
 * SiteOperationScheduleクラスは、現場の稼働予定を管理するためのモデルクラスです。
 * FireModelクラスを継承し、Firestoreとの連携やCRUD操作を簡素化します。
 *
 * 主な機能:
 * - Firestoreコレクション 'SiteOperationSchedules' に対するCRUD操作
 * - カレンダー用イベントへの変換機能
 * - 稼働予定のバリデーション機能
 * - 同一日・同一勤務区分の稼働予定は登録できないように制限されています。
 * - subscribeAsEvent、subscribeGroupAsEventを利用することで、v-calenderのイベントとして使用できるオブジェクトの配列への参照が返されます。
 *
 * 使用例:
 * ---------------------------------------------------------------
 * import { firestore, auth } from '@/plugins/firebase';
 * import SiteOperationSchedule from '@/models/SiteOperationSchedule';
 *
 * const schedule = new SiteOperationSchedule({ firestore, auth }, { siteId: 'sampleSite', date: '2024-06-20' });
 * schedule.create().then(docRef => {
 *   console.log('Document created with ID: ', docRef.id);
 * });
 * ---------------------------------------------------------------
 *
 * props設定:
 * このクラスで管理するプロパティは、props.propsの中でvueコンポーネントのpropsのルールに合わせて定義しています。
 * これにより、Mixinsを利用することでクラスに依存するコンポーネントのpropsを一元管理できます。
 *
 * injectの利用:
 * Nuxtのinjectを利用してコンポーネントからのアクセスを容易にすることも可能です。
 * plugins/models.js:
 * ---------------------------------------------------------------
 * import SiteOperationSchedule from '../models/SiteOperationSchedule'
 *
 * export default (context, inject) => {
 *   const firebase = {
 *     firestore: context.app.$firestore,
 *     auth: context.app.$auth,
 *   }
 *   inject('SiteOperationSchedule', (item) => new SiteOperationSchedule(firebase, item))
 * }
 * ---------------------------------------------------------------
 *
 * 更新履歴:
 * 2024-06-20 - 初版作成
 *
 * 注意事項:
 * このクラスはNuxt.jsのコンテキストに依存しないよう設計されていますが、
 * FirestoreとAuthenticationインスタンスを渡す必要があります。
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
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
    // for searching only the site schedules created as temporary.
    temporary: { type: Boolean, default: false, required: false },
  },
}
export { props }

export default class SiteOperationSchedule extends FireModel {
  #fetchedSites = []
  constructor(context, item = {}) {
    super(context, item)
    this.tokenFields = []
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
  subscribeAsEvent(
    { from, to, temporary } = {
      from: undefined,
      to: undefined,
      temporary: false,
    }
  ) {
    const constraints = [where('date', '>=', from), where('date', '<=', to)]
    if (temporary) constraints.push(where('temporary', '==', true))
    const items = super.subscribe(undefined, constraints, this.convertToEvent)
    return items
  }

  /**
   * コレクショングループへのリアルタイムリスナーを開始します。
   * 参照として返される配列にはカレンダー用のイベントに変換されたオブジェクトです。
   * @param {string} from - 取得する日付範囲の開始日
   * @param {*} to - 取得する日付範囲の最終日
   * @param {*} temporary - trueにするとスポット現場の稼働予定のみを取得
   * @returns 取得したドキュメントデータをカレンダー用のイベントに変換したオブジェクトが格納されている配列への参照
   */
  subscribeGroupAsEvent(
    { from, to, temporary } = {
      from: undefined,
      to: undefined,
      temporary: false,
    }
  ) {
    const constraints = [where('date', '>=', from), where('date', '<=', to)]
    if (temporary) constraints.push(where('temporary', '==', true))
    const items = super.subscribeGroup(
      undefined,
      constraints,
      this.convertToEvent
    )
    return items
  }

  convertToEvent = async (data) => {
    const getSite = async (siteId) => {
      const site = this.#fetchedSites.find(({ docId }) => docId === siteId)
      if (site) return site
      const docRef = doc(this.firestore, `Sites/${siteId}`)
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) {
        const errMsg = `Could not find site document. id: ${siteId}`
        // eslint-disable-next-line
        console.error(errMsg)
        throw new Error(errMsg)
      }
      this.#fetchedSites.push(snapshot.data())
      return snapshot.data()
    }
    const site = await getSite(data.siteId)
    return {
      name: site.name,
      date: data.date,
      workShift: data.workShift,
      requiredWorkers: data.requiredWorkers,
      start: data.start,
      color: data.workShift === 'day' ? 'blue' : 'red',
      site,
      schedule: data,
    }
  }
}
