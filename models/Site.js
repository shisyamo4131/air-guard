/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class Site extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Sites'
  }

  initialize(item) {
    this.code = null
    this.name = null
    this.abbr = null
    this.abbrKana = null
    this.address = null
    this.customerId = null
    this.status = 'active'
    super.initialize(item)
  }
}
