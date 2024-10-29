import { database } from 'air-firebase' // Firebaseのインスタンスをインポート
import { ref, onValue, set } from 'firebase/database' // Firebase Realtime Databaseの関数をインポート

/**
 * ArrangementSiteIndexクラスは、Firebase Realtime Databaseの
 * `Arrangements/siteWorkShiftIds`をリアルタイムで管理するためのクラスです。
 * このクラスはsiteWorkShiftIds（現場のインデックス）を監視し、追加や削除操作を行います。
 */
export default class ArrangementSiteIndex {
  // プライベートプロパティとして、リアルタイムリスナーを保持する変数
  #listener = null

  /**
   * ArrangementSiteIndexのインスタンスを作成します。
   * インスタンス化時に、siteWorkShiftIdsに対するリアルタイムリスナーが自動的に設定されます。
   */
  constructor() {
    this.data = [] // 現在のsiteWorkShiftIdsデータを保持するプロパティ
    this.#subscribe() // コンストラクタ内でリアルタイムリスナーを設定
  }

  /**
   * Realtime Database への参照を返します。
   * @returns {firebase.database.Reference} Firebaseの参照オブジェクト
   */
  get dbRef() {
    return ref(database, `Arrangements/siteWorkShiftIds`)
  }

  /**
   * Realtime DatabaseのsiteWorkShiftIdsに対するリアルタイムリスナーを設定します。
   * プライベートメソッドとして扱い、外部からの呼び出しは避けます。
   */
  #subscribe() {
    try {
      // リアルタイムリスナーの設定
      this.#listener = onValue(this.dbRef, (snapshot) => {
        const data = snapshot.val()
        // siteWorkShiftIdsが存在し、配列形式である場合は更新、そうでない場合は空配列を設定
        this.data = Array.isArray(data) ? data : []
      })
    } catch (error) {
      console.error('Failed to subscribe to Realtime Database:', error)
    }
  }

  /**
   * リアルタイムリスナーを解除します。
   * 解除後、#listenerはnullにリセットされます。
   */
  unsubscribe() {
    try {
      if (this.#listener) this.#listener() // リスナーが設定されている場合は解除
      this.#listener = null
    } catch (error) {
      console.error('Failed to unsubscribe from Realtime Database:', error)
    }
  }

  /**
   * siteWorkShiftIdsに `${siteId}-${workShift}` を追加します。
   * すでに存在する `${siteId}-${workShift}` は追加されません。
   * @param {string} siteId - 追加するsiteのID
   * @param {string} workShift - 追加するシフトの情報
   * @throws {TypeError} siteIdまたはworkShiftが文字列でない場合にエラーをスローします。
   */
  async add(siteId, workShift) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError(
        '引数 "siteId" と "workShift" は文字列である必要があります。'
      )
    }

    const key = `${siteId}-${workShift}`
    try {
      if (!this.data.includes(key)) {
        const updatedIndex = [...this.data, key]
        await set(this.dbRef, updatedIndex)
      }
    } catch (error) {
      throw new Error(`Failed to add new key "${key}": ${error.message}`)
    }
  }

  /**
   * siteWorkShiftIdsから指定した `${siteId}-${workShift}` を削除します。
   * @param {string} siteId - 削除するsiteのID
   * @param {string} workShift - 削除するシフトの情報
   * @throws {TypeError} siteIdまたはworkShiftが文字列でない場合にエラーをスローします。
   */
  async remove(siteId, workShift) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError(
        '引数 "siteId" と "workShift" は文字列である必要があります。'
      )
    }

    const key = `${siteId}-${workShift}`
    try {
      const updatedIndex = this.data.filter((id) => id !== key)
      await set(this.dbRef, updatedIndex)
    } catch (error) {
      throw new Error(`Failed to remove key "${key}": ${error.message}`)
    }
  }

  /**
   * Arrangements/siteWorkShiftIds を更新します。
   * @param {Array} val 新しい siteWorkShiftIds の配列です。
   * @throws {TypeError} 引数が配列でない場合にエラーをスローします。
   */
  async update(val) {
    if (!Array.isArray(val)) {
      throw new TypeError('引数 "val" は配列である必要があります。')
    }

    try {
      await set(this.dbRef, val)
    } catch (err) {
      throw new Error(
        'Arrangements/siteWorkShiftIds の更新処理に失敗しました。'
      )
    }
  }
}
