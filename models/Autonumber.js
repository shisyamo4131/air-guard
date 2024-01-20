import FireModel from './FireModel'
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
  }

  initialize(item) {
    this.collectionId = null
    this.current = 0
    this.length = null
    this.field = 'code'
    this.status = true
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
}
