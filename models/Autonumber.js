/*****************************************************************************
 * カスタムクラス定義: 自動採番 - Autonumber -
 *
 * @author shisyamo4131
 * @refact 2025-01-30
 *****************************************************************************/
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { FireModel, firestore } from 'air-firebase'
import { generateProps } from './propsDefinition/propsUtil'

/**
 * PROPERTIES
 */
const propsDefinition = {
  // ドキュメントID
  docId: { type: String, default: '', required: false },

  // コレクションID
  collectionId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 現在値
  current: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
    required: false,
    requiredByClass: true,
  },

  // 桁数
  length: {
    type: Number,
    default: 4,
    validator: (v) => v > 0,
    required: false,
    requiredByClass: true,
  },

  // フィールド名
  field: {
    type: String,
    default: 'code',
    required: false,
    requiredByClass: true,
  },

  // 状態
  status: {
    type: Boolean,
    default: true,
    required: false,
    requiredByClass: true,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)
export { vueProps }

/*****************************************************************************
 * カスタムクラス - default -
 *****************************************************************************/
export default class Autonumber extends FireModel {
  // FireModel 設定
  static collectionPath = 'Autonumbers'
  static classProps = classProps
  static tokenFields = ['collectionId']

  /**
   * ドキュメント作成前の処理です。
   * - 現在値と桁数が 0 以上の整数であることを確認します。
   *
   * @returns {Promise<void>} 処理が完了すると解決される Promise です。
   * @throws {Error} `current` または `length` が 0 以上の整数でない場合にエラーをスローします。
   */
  beforeCreate() {
    return new Promise((resolve, reject) => {
      if (this.current < 0 || this.length < 0) {
        return reject(
          new Error('現在値および桁数は 0 以上で設定してください。')
        )
      }
      resolve()
    })
  }

  /**
   * ドキュメント更新前の処理です。
   * - コレクション名が変更されていないことを確認します。
   * - 現在値と桁数が 0 以上の整数であることを確認します。
   *
   * @returns {Promise<void>} 処理が完了すると解決される Promise です。
   * @throws {Error} 無効な値が存在する場合にエラーをスローします。
   */
  beforeUpdate() {
    return new Promise((resolve, reject) => {
      if (this.docId !== this.collectionId) {
        return reject(new Error('コレクション名を変更することはできません。'))
      }
      if (this.current < 0 || this.length < 0) {
        return reject(
          new Error('現在値および桁数は 0 以上で設定してください。')
        )
      }
      resolve()
    })
  }

  /**
   * ドキュメントの作成処理をオーバーライドします。
   * - ドキュメントIDをコレクション名に固定します。
   * @returns {Promise<DocumentReference>} 作成されたドキュメントへの参照
   * @throws {Error} ドキュメントの作成に失敗した場合
   */
  async create() {
    return await super.create({ docId: this.collectionId })
  }

  /**
   * 指定されたコレクションのステータスを true に更新します。
   * - ステータスが true に更新されると、当該コレクションへのドキュメント作成時に自動採番が行われます。
   * - 既に true になっている場合は更新処理を行いません。
   *
   * @param {string} collectionId - 自動採番を開始するコレクション名
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または自動採番の開始に失敗した場合
   */
  static async start(collectionId) {
    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('有効なコレクションIDを指定してください。')
    }
    try {
      const instance = new this()
      if (!(await instance.fetch(collectionId))) {
        throw new Error(
          `Autonumbers コレクションに ${collectionId} ドキュメントが存在しません。`
        )
      }
      if (instance.status) {
        // eslint-disable-next-line no-console
        console.warn(
          `${collectionId} コレクションの自動採番は既に開始されています。`
        )
      } else {
        instance.status = true
        await instance.update()
        // eslint-disable-next-line no-console
        console.info(`${collectionId} コレクションの自動採番を開始しました。`)
      }
    } catch (error) {
      const message = `${collectionId} コレクションの自動採番の開始に失敗しました:`
      // eslint-disable-next-line no-console
      console.error(message, error)
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * 指定されたコレクションのステータスを false に更新します。
   * - ステータスが false に更新されると、当該コレクションへのドキュメント作成時に自動採番が行われなくなります。
   * - 既に false になっている場合は更新処理を行いません。
   *
   * @param {string} collectionId - 自動採番を停止するコレクション名
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または自動採番の停止に失敗した場合
   */
  static async stop(collectionId) {
    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('有効なコレクションIDを指定してください。')
    }

    try {
      const instance = new this()
      if (!(await instance.fetch(collectionId))) {
        throw new Error(
          `Autonumbersコレクションに ${collectionId} ドキュメントが存在しません。`
        )
      }
      if (!instance.status) {
        // eslint-disable-next-line no-console
        console.warn(
          `${collectionId} コレクションの自動採番は既に停止されています。`
        )
      } else {
        instance.status = false
        await instance.update()
        // eslint-disable-next-line no-console
        console.info(`${collectionId} コレクションの自動採番を停止しました。`)
      }
    } catch (error) {
      const message = `${collectionId} コレクションの自動採番の停止に失敗しました:`
      // eslint-disable-next-line no-console
      console.error(message, error)
      throw new Error(`${message} ${error.message}`)
    }
  }

  /**
   * 指定されたコレクションの自動採番について、現在値を指定された値に更新します。
   * 値が指定されなかった場合、指定されたコレクションのドキュメントに使用されている
   * 最大値が適用されます。
   * @param {string} collectionId 対象のコレクションIDです。
   * @param {string | number} val 更新する値です。
   * @returns {Promise<void>} 処理が完了すると解決されるPromise
   * @throws {Error} コレクションIDが無効な場合、または更新に失敗した場合
   */
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
