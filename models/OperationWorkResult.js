import FireModel from './FireModel'
import { props } from './props/OperationResultWorker'

export default class OperationResultWorker extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'OperationWorkResults'
  }

  initialize(item = {}) {
    Object.keys(props).forEach((key) => {
      const propDefault = props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  async toDraft() {
    this.transportationCost.status = '1:draft'
    this.transportationCost.draftAt = this.dateJst.getTime()
    await super.update()
  }
}
