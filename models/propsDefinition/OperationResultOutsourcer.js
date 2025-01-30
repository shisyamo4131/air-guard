/**
 * 外注先稼働実績明細のプロパティ定義です。
 * - 稼働実績明細のプロパティ定義を拡張しています。
 * @refact 2025-01-30
 */
import { generateProps } from './propsUtil'
import {
  propsDefinition as sourceProps,
  accessor as sourceAccessor,
} from './OperationResultDetail'

/*****************************************************************************
 * PROPS DEFINITION
 *****************************************************************************/
const propsDefinition = {
  ...sourceProps,

  /**
   * データを一意に識別するための id
   * - Accessor によって outsourcerId と branch の組み合わせがセットされることを想定
   */
  id: { type: String, default: '', required: false },

  // 外注先ID
  outsourcerId: { type: String, default: '', required: false },

  // 枝番
  branch: { type: Number, default: null, required: false },
}

/*****************************************************************************
 * ACCESSOR
 *****************************************************************************/
const accessor = {
  ...sourceAccessor,

  // 必ず employeeId を返します。
  id: {
    configurable: true,
    enumerable: true,
    get() {
      return `${this.outsourcerId}-${this.branch}`
    },
    set(v) {},
  },

  // 従業員フラグは必ず false を返します。
  isEmployee: {
    configurable: true,
    enumerable: true,
    get() {
      return false
    },
    set(v) {},
  },

  // 外注先フラグは必ず true を返します。
  isOutsourcer: {
    configurable: true,
    enumerable: true,
    get() {
      return true
    },
    set(v) {},
  },
}
const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps, accessor }
