import FireModel from './FireModel'

const props = {
  props: {
    uid: { type: String, default: '', required: false },
    displayName: { type: String, default: '', required: false },
  },
}
export { props }

/**
 * ## User
 * @author shisyamo4131
 */
export default class User extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
    this.collection = 'Users'
  }

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }
}
