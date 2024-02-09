import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import FireModel from './FireModel'

const props = {
  props: {
    collectionId: { type: String, default: '', required: false },
    current: { type: Number, default: null, required: false },
    length: { type: Number, default: null, required: false },
    field: { type: String, default: 'code', required: false },
    status: { type: Boolean, default: true, required: false },
  },
}
export { props }

/**
 * ### Autonumber
 * 自動採番管理データモデルです。
 * FireModelはドキュメント登録時に、対象のコレクション名をドキュメントIDとする
 * Autonumberドキュメントを参照します。
 * よって、AutonumberドキュメントのIDはコレクション名と一致している必要があります。
 *
 * | property     | type    | default | required | description |
 * | ------------ | ------- | ------- | -------- | ----------- |
 * | collectionId | string  | null    | true     |             |
 * | current      | number  | 0       | true     |             |
 * | length       | number  | null    | true     |             |
 * | field        | string  | 'code'  | true     |             |
 * | status       | boolean | true    | true     |             |
 *
 * @author shisyamo4131
 */
export default class Autonumber extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Autonumbers'
    this.tokenFields = ['collectionId']
  }

  initialize(item) {
    Object.keys(props.props)
      .filter((key) => !(key in this))
      .forEach((key) => {
        Object.defineProperty(this, key, {
          value: props.props[key].default,
          enumerable: true,
          writable: true,
        })
      })
    super.initialize(item)
  }

  // 現在値（current）と桁数（length）は正数でなければなりません。
  beforeCreate() {
    return new Promise((resolve, reject) => {
      if (this.current < 0 || this.length < 0) {
        reject(new Error('A current must be positive.'))
      }
      resolve()
    })
  }

  // 登録時、ドキュメントIDはコレクション名とします。
  async create() {
    await super.create(this.collectionId)
  }

  // 変更時、ドキュメントIDとコレクション名が一致していなければなりません。
  // -> コレクション名は変更不可。
  async update() {
    if (this.docId !== this.collectionId) {
      throw new Error('A collection name can not be modified.')
    }
    await super.update()
  }

  // 現在値（current）と桁数（length）は正数でなければなりません。
  beforeUpdate() {
    return new Promise((resolve, reject) => {
      if (this.current < 0 || this.length < 0) {
        reject(new Error('A current must be positive.'))
      }
      resolve()
    })
  }

  /**
   * 指定されたコレクションの自動採番を開始します。
   * @param {string} collectionId 対象のコレクションIDです。
   */
  async start(collectionId) {
    const docRef = doc(this.firestore, `Autonumbers/${collectionId}`)
    await updateDoc(docRef, { status: true })
  }

  /**
   * 指定されたコレクションの自動採番を停止します。
   * @param {string} collectionId 対象のコレクションIDです。
   */
  async stop(collectionId) {
    const docRef = doc(this.firestore, `Autonumbers/${collectionId}`)
    await updateDoc(docRef, { status: false })
  }

  /**
   * 指定されたコレクションの自動採番について、現在値を指定された値に更新します。
   * 値が指定されなかった場合、指定されたコレクションのドキュメントに使用されている
   * 最大値が適用されます。
   * @param {string} collectionId 対象のコレクションIDです。
   * @param {string | number} val 更新する値です。
   */
  async refresh(collectionId, val = undefined) {
    const docRef = doc(this.firestore, `Autonumbers/${collectionId}`)
    const docSnapshot = await getDoc(docRef)
    if (!docSnapshot.exists()) {
      throw new Error(`[Autonumber.js] Could not find the specified document.`)
    }
    const field = docSnapshot.data().field
    const getCurrent = async () => {
      const colRef = collection(this.firestore, collectionId)
      const q = query(colRef, orderBy(field, 'desc'), limit(1))
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty
        ? 0
        : parseInt(querySnapshot.docs[0].data()[field])
    }
    const current = val || val === 0 ? parseInt(val) : await getCurrent()
    await updateDoc(docRef, { current })
    // eslint-disable-next-line
    console.info(
      `[Autonumber.js] ${collectionId} コレクションの自動採番現在値を ${current} に更新しました。`
    )
  }
}
