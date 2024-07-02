/**
 * ### MedicalCheckup.js
 *
 * 概要:
 * 従業員の健康診断情報を管理するためのデータモデルです。
 *
 * 機能詳細:
 *
 * 注意事項:
 * - 従業員情報が削除されるとCloud Functionsによって同期削除されます。
 *
 * @author shisyamo4131
 * @create 2024-07-02
 * @version 1.0.0
 */
import FireModel from './FireModel'

const props = {
  props: {
    employeeId: { type: String, default: '', required: false },
    date: { type: String, default: '', required: false },
    type: {
      type: String,
      default: 'entry',
      validator: (v) => ['entry', 'regular'].includes(v),
      required: false,
    },
    bloodPressure: {
      type: Object,
      default: () => {
        return {
          top: null,
          bottom: null,
        }
      },
      required: false,
    },
    remarks: { type: String, default: '', required: false },
  },
}
export { props }

export default class MedicalCheckup extends FireModel {
  constructor(context, item = {}) {
    super(context, item)
  }

  get collection() {
    return `Employees/${this.employeeId}/MedicalCheckups`
  }

  set collection(v) {}

  initialize(item = {}) {
    Object.keys(props.props).forEach((key) => {
      const propDefault = props.props[key].default
      this[key] =
        typeof propDefault === 'function' ? propDefault() : propDefault
    })
    super.initialize(item)
  }

  create() {
    const docId = this.date
    super.create(docId)
  }
}
