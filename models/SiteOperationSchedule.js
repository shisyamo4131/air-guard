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

/**
 * ## SiteOperationSchedule
 * @author shisyamo4131
 */
export default class SiteOperationSchedule extends FireModel {
  #fetchedSites = []
  constructor(context, item) {
    super(context, item)
    // this.collection = 'Placements'
    this.tokenFields = []
  }

  get collection() {
    return `Sites/${this.siteId}/SiteOperationSchedules`
  }

  set collection(v) {}

  initialize(item) {
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
    if (!querySnapshot.empty)
      throw new Error('同一日、同一勤務区分の稼働予定が既に登録されています。')
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
    if (!querySnapshot.empty)
      throw new Error('同一日、同一勤務区分の稼働予定が既に登録されています。')
  }

  /**
   * コレクションへのリアルタイムリスナーを開始します。
   * 参照として返される配列にはカレンダー用のイベントに変換されたオブジェクトです。
   * @param {string} from - 取得する日付範囲の開始日
   * @param {*} to - 取得する日付範囲の最終日
   * @param {*} temporary - trueにするとスポット現場の稼働予定のみを取得
   * @returns 取得したドキュメントデータをカレンダー用のイベントに変換したオブジェクトが格納されている配列への参照
   */
  subscribeAsEvents(
    { from, to, temporary } = {
      from: undefined,
      to: undefined,
      temporary: false,
    }
  ) {
    const convertToEvent = async (data) => {
      const getSite = async (siteId) => {
        const site = this.#fetchedSites.find(({ docId }) => docId === siteId)
        if (site) return site
        const docRef = doc(this.firestore, `Sites/${siteId}`)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists())
          throw new Error('Could not find site document. id:', siteId)
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
    const constraints = [where('date', '>=', from), where('date', '<=', to)]
    if (temporary) constraints.push(where('temporary', '==', true))
    const items = super.subscribe(undefined, constraints, convertToEvent)
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
  subscribeGroupAsEvents(
    { from, to, temporary } = {
      from: undefined,
      to: undefined,
      temporary: false,
    }
  ) {
    const convertToEvent = async (data) => {
      const getSite = async (siteId) => {
        const site = this.#fetchedSites.find(({ docId }) => docId === siteId)
        if (site) return site
        const docRef = doc(this.firestore, `Sites/${siteId}`)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists())
          throw new Error('Could not find site document. id:', siteId)
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
    const constraints = [where('date', '>=', from), where('date', '<=', to)]
    if (temporary) constraints.push(where('temporary', '==', true))
    const items = super.subscribeGroup(undefined, constraints, convertToEvent)
    return items
  }
}
