import { database } from 'air-firebase' // Firebaseのインスタンスをインポート
import {
  ref,
  onValue,
  query,
  orderByKey,
  startAt,
  endAt,
  child,
} from 'firebase/database' // Firebase Realtime Databaseの関数をインポート

/**
 * ArrangementAssignmentsMonitorクラスは、Firebase Realtime Databaseの
 * `Arrangements/assignments`をリアルタイムで管理するためのクラスです。
 * このクラスはassignments（従業員の配置情報）を監視します。
 */
export default class ArrangementAssignmentsMonitor {
  // プライベートプロパティとして、リアルタイムリスナーを保持する変数
  #listeners = { employees: null, sites: null }

  constructor() {
    this.employees = {} // 現在のassignmentsデータを保持するプロパティ
    this.sites = {} // 現在のassignmentsデータを保持するプロパティ
  }

  /**
   * Realtime Database への参照を返します。
   * @returns {firebase.database.Reference} Firebaseの参照オブジェクト
   */
  get dbRef() {
    return ref(database, `Arrangements/assignments`)
  }

  /**
   * Realtime Databaseのassignmentsに対するリアルタイムリスナーを設定します。
   * from と to の範囲でデータを絞り込みます。
   * @param {string} from - 開始日（YYYY-MM-DD形式）
   * @param {string} to - 終了日（YYYY-MM-DD形式）
   */
  subscribe(from, to) {
    this.unsubscribe()
    try {
      // from と to をキーの範囲として使用してクエリを設定
      const employeesQuery = query(
        child(this.dbRef, 'employees'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )
      const sitesQuery = query(
        child(this.dbRef, 'sites'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )
      // リアルタイムリスナーの設定
      this.#listeners.employees = onValue(employeesQuery, (snapshot) => {
        const data = snapshot.val()
        // assignmentsが存在し、オブジェクト形式である場合は更新、そうでない場合は空オブジェクトを設定
        this.employees = data && typeof data === 'object' ? data : {}
      })
      this.#listeners.sites = onValue(sitesQuery, (snapshot) => {
        const data = snapshot.val()
        // assignmentsが存在し、オブジェクト形式である場合は更新、そうでない場合は空オブジェクトを設定
        this.sites = data && typeof data === 'object' ? data : {}
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to Realtime Database:', error)
    }
  }

  /**
   * リアルタイムリスナーを解除します。
   * 解除後、#listenersはnullにリセットされます。
   */
  unsubscribe() {
    try {
      Object.keys(this.#listeners).forEach((key) => {
        if (this.#listeners[key]) this.#listeners()
        this.#listeners[key] = null
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from Realtime Database:', error)
    }
  }
}
