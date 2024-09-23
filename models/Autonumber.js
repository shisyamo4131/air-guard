import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { classProps } from './propsDefinition/Autonumber'

/**
 * Autonumbersドキュメントデータモデル【物理削除】
 *
 * - コレクションごとの自動採番を管理するデータモデルです。
 * - FireModelは、createメソッド実行時に`useAutonumber`フラグがtrueの場合、
 *   管理対象コレクション名をドキュメントIDとするAutonumbersドキュメントを参照します。
 * - 該当するドキュメントが存在すると、ドキュメントの状態に応じた自動採番を行います。
 * - `status`が`false`であった場合、自動採番は行われません。
 *
 * @version 2.0.0
 * @author shisyamo4131
 * @updates
 * - version 2.0.0 - 2024-08-22 - FireModelのパッケージ化に伴って再作成
 */
export default class Autonumber extends FireModel {
  /****************************************************************************
   * CONSTRUCTOR
   ****************************************************************************/
  constructor(item = {}) {
    super(item, 'Autonumbers', [], false, ['collectionId'], classProps)
  }

  /****************************************************************************
   * ドキュメントが作成される直前に実行される処理です。
   * - `current`と`length`は正の整数でなければなりません。
   * - 無効な値がある場合はエラーをスローします。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} currentまたはlengthが正の整数でない場合
   ****************************************************************************/
  beforeCreate() {
    if (this.current < 0) {
      return Promise.reject(
        new Error('現在値は0以上の整数でなければなりません。')
      )
    }
    if (this.length < 0) {
      return Promise.reject(
        new Error('長さは0以上の整数でなければなりません。')
      )
    }
    return super.beforeCreate()
  }

  /****************************************************************************
   * ドキュメントの更新処理直前に実行されます。
   * - コレクション名（docId）は変更できません。
   * - `current`と`length`は正の整数でなければなりません。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} 無効な値が存在する場合
   ****************************************************************************/
  beforeUpdate() {
    if (this.docId !== this.collectionId) {
      return Promise.reject(
        new Error('コレクション名を変更することはできません。')
      )
    }
    if (this.current < 0) {
      return Promise.reject(
        new Error('現在値は0以上の整数でなければなりません。')
      )
    }
    if (this.length < 0) {
      return Promise.reject(
        new Error('長さは0以上の整数でなければなりません。')
      )
    }
    return super.beforeUpdate()
  }

  /****************************************************************************
   * ドキュメントの作成処理をオーバーライドします。
   * - ドキュメントIDは`collectionId`に設定されたコレクション名に固定します。
   * @returns {Promise<DocumentReference>} 作成されたドキュメントへの参照
   * @throws {Error} ドキュメントの作成に失敗した場合
   ****************************************************************************/
  async create() {
    try {
      return await super.create({ docId: this.collectionId })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ドキュメントの作成に失敗しました:', error)
      throw new Error('ドキュメントの作成中にエラーが発生しました。')
    }
  }

  /****************************************************************************
   * 指定されたコレクションの自動採番を開始します。
   * - コレクションIDが空または無効な場合、エラーをスローします。
   * @param {string} collectionId 対象のコレクションIDです。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または自動採番の開始に失敗した場合
   ****************************************************************************/
  static async start(collectionId) {
    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('有効なコレクションIDを指定してください。')
    }
    try {
      const instance = new this()
      if (!(await instance.fetch(collectionId))) {
        throw new Error(
          `Autonumbersコレクションに${collectionId}ドキュメントが存在しません。`
        )
      }
      if (instance.status) {
        // eslint-disable-next-line no-console
        console.warn(
          `${collectionId}コレクションの自動採番は既に開始されています。`
        )
      } else {
        instance.status = true
        await instance.update()
        // eslint-disable-next-line no-console
        console.info(`${collectionId}コレクションの自動採番を開始しました。`)
      }
    } catch (error) {
      const message = `${collectionId}コレクションの自動採番の開始に失敗しました:`
      // eslint-disable-next-line no-console
      console.error(message, error)
      throw new Error(`${message} ${error.message}`)
    }
  }

  /****************************************************************************
   * 指定されたコレクションの自動採番を停止します。
   * @param {string} collectionId 対象のコレクションIDです。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または自動採番の停止に失敗した場合
   ****************************************************************************/
  static async stop(collectionId) {
    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('有効なコレクションIDを指定してください。')
    }

    try {
      const instance = new this()
      if (!(await instance.fetch(collectionId))) {
        throw new Error(
          `Autonumbersコレクションに${collectionId}ドキュメントが存在しません。`
        )
      }
      if (!instance.status) {
        // eslint-disable-next-line no-console
        console.warn(
          `${collectionId}コレクションの自動採番は既に停止されています。`
        )
      } else {
        instance.status = false
        await instance.update()
        // eslint-disable-next-line no-console
        console.info(`${collectionId}コレクションの自動採番を停止しました。`)
      }
    } catch (error) {
      const message = `${collectionId}コレクションの自動採番の停止に失敗しました:`
      // eslint-disable-next-line no-console
      console.error(message, error)
      throw new Error(`${message} ${error.message}`)
    }
  }

  /****************************************************************************
   * 指定されたコレクションの自動採番について、現在値を指定された値に更新します。
   * 値が指定されなかった場合、指定されたコレクションのドキュメントに使用されている
   * 最大値が適用されます。
   * @param {string} collectionId 対象のコレクションIDです。
   * @param {string | number} val 更新する値です。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または更新に失敗した場合
   ****************************************************************************/
  static async refresh(collectionId, val = undefined) {
    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('有効なコレクションIDを指定してください。')
    }
    if (
      val !== undefined &&
      typeof val !== 'string' &&
      typeof val !== 'number'
    ) {
      throw new Error('更新する値は数値または文字列で指定してください。')
    }

    try {
      const instance = new this()
      if (!(await instance.fetch(collectionId))) {
        throw new Error(
          `Autonumbersコレクションに${collectionId}ドキュメントが存在しません。`
        )
      }

      const getMaxFieldValue = async (field) => {
        try {
          const colRef = collection(firestore, collectionId)
          const q = query(colRef, orderBy(field, 'desc'), limit(1))
          const querySnapshot = await getDocs(q)
          return querySnapshot.empty
            ? 0
            : parseInt(querySnapshot.docs[0].data()[field], 10)
        } catch (error) {
          throw new Error(
            `コレクション内の最大値を取得する際にエラーが発生しました: ${error.message}`
          )
        }
      }

      instance.current =
        val !== undefined && val !== null
          ? parseInt(val, 10)
          : await getMaxFieldValue(instance.field)

      await instance.update()
      // eslint-disable-next-line no-console
      console.info(
        `[Autonumber.js] ${collectionId} コレクションの自動採番現在値を ${instance.current} に更新しました。`
      )
    } catch (error) {
      const message = `${collectionId} コレクションの自動採番現在値の更新に失敗しました:`
      // eslint-disable-next-line no-console
      console.error(message, error)
      throw new Error(`${message} ${error.message}`)
    }
  }
}
