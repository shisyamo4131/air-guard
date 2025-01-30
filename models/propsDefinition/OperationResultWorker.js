/**
 * 従業員稼働実績明細のプロパティ定義です。
 * - 稼働実績明細のプロパティ定義を拡張しています。
 * @refact 2025-01-30
 */
import { generateVueProps, generateClassProps } from './propsUtil'
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
   * - Accessor によって employeeId がセットされることを想定
   */
  id: { type: String, default: '', required: false },

  // 従業員ID
  employeeId: { type: String, default: '', required: false },
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
      return this.employeeId
    },
    set(v) {},
  },

  // 従業員フラグは必ず true を返します。
  isEmployee: {
    configurable: true,
    enumerable: true,
    get() {
      return true
    },
    set(v) {},
  },

  // 外注先フラグは必ず false を返します。
  isOutsourcer: {
    configurable: true,
    enumerable: true,
    get() {
      return false
    },
    set(v) {},
  },
}
const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps, accessor, propsDefinition }
