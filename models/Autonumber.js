import FireModel from './FireModel'
/**
 * ### Autonumber
 * A model used to manage automatic numbering.
 *
 * | property | type    | default | required | description |
 * | -------- | ------- | ------- | -------- | ----------- |
 * | current  | number  | 0       | true     |             |
 * | length   | number  | null    | true     |             |
 * | field    | string  | ''      | true     |             |
 * | status   | boolean | true    | true     |             |
 */
export default class Autonumber extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Autonumbers'
  }

  initialize(item) {
    this.current = 0
    this.length = null
    this.field = ''
    this.status = true
    super.initialize(item)
  }

  beforeCreate() {
    return new Promise((resolve, reject) => {
      if (this.current < 0 || this.length < 0) {
        reject(new Error('A current must be positive.'))
      }
      resolve()
    })
  }

  beforeUpdate() {
    return new Promise((resolve, reject) => {
      if (this.current < 0 || this.length < 0) {
        reject(new Error('A current must be positive.'))
      }
      resolve()
    })
  }
}
