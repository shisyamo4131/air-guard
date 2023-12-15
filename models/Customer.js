/**
 * @author shisyamo4131
 */
import FireModel from './FireModel'

export default class Customer extends FireModel {
  constructor(context, item) {
    super(context, item)
    this.collection = 'Customers'
  }

  initialize(item) {
    this.code = null
    this.name1 = null
    this.name2 = null
    this.abbr = null
    this.abbrKana = null
    this.address = null
    this.status = 'active'
    super.initialize(item)
  }
}
