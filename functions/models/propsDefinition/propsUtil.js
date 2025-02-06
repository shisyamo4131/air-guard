/**
 * 指定された `propsDefinition` から、Vue コンポーネント用 (`vueProps`) と
 * クラス用 (`classProps`) のプロパティオブジェクトを生成します。
 *
 * - `vueProps` は Vue コンポーネントの `props` 定義として使用します。
 * - `classProps` は データモデルクラスのプロパティ定義として使用します。
 *
 * @param {Object} propsDefinition - 各プロパティの設定オブジェクトです。
 * @param {Function} propsDefinition[].type - プロパティの型を指定します。
 * @param {*} [propsDefinition[].default] - デフォルト値を指定します。
 * @param {boolean} [propsDefinition[].required] - Vue コンポーネントで必須かどうかを指定します。
 * @param {boolean} [propsDefinition[].requiredByClass] - クラスで必須かどうかを指定します。
 * @param {Function} [propsDefinition[].validator] - 値のバリデーション関数を指定します。
 *
 * @returns {Object} 生成されたプロパティオブジェクトを返します。
 * @returns {Object} return.vueProps - Vue 用の `props` オブジェクトです。
 * @returns {Object} return.classProps - クラス用の `props` オブジェクトです。
 */
export function generateProps(propsDefinition) {
  return Object.keys(propsDefinition).reduce(
    (result, key) => {
      const {
        type,
        default: defaultValue,
        required,
        requiredByClass,
        validator,
      } = propsDefinition[key]

      // Vue 用の props 設定
      result.vueProps[key] = {
        type,
        default: defaultValue,
        required: required || false,
      }
      if (validator) {
        result.vueProps[key].validator = validator
      }

      // クラス用の props 設定
      result.classProps[key] = {
        type,
        default: defaultValue,
        required: requiredByClass || false,
      }
      if (validator) {
        result.classProps[key].validator = validator
      }

      return result
    },
    { vueProps: {}, classProps: {} } // 初期値
  )
}

/****************************************************************************
 * 関数名: generateVueProps
 * 説明: 指定された`propsDefinition`オブジェクトから、Vueコンポーネント用の
 *       `vueProps`オブジェクトを生成します。この関数は、Vueコンポーネント内で
 *       使用される`required`、`default`、`type`プロパティを利用します。
 *
 * パラメータ:
 *    - propsDefinition (Object): データモデルのプロパティを定義するオブジェクト。
 *                                各プロパティは`type`、`default`、`required`、
 *                                およびオプションで`validator`を含む必要があります。
 *
 * 戻り値:
 *    - Object: Vueコンポーネント用の`props`オブジェクトで、各キーに対して
 *              `type`、`default`、`required`、およびオプションで`validator`を
 *              含むプロパティを返します。
 ****************************************************************************/
function generateVueProps(propsDefinition) {
  return Object.keys(propsDefinition).reduce((result, key) => {
    const {
      type,
      default: defaultValue,
      required,
      validator,
    } = propsDefinition[key]
    result[key] = { type, default: defaultValue, required }
    if (validator) {
      result[key].validator = validator
    }
    return result
  }, {})
}

/****************************************************************************
 * 関数名: generateClassProps
 * 説明: 指定された`propsDefinition`オブジェクトから、データモデルクラス用の
 *       `classProps`オブジェクトを生成します。この関数は、データモデルクラス内で
 *       使用される`requiredByClass`、`default`、`type`プロパティを利用します。
 *
 * パラメータ:
 *    - propsDefinition (Object): データモデルのプロパティを定義するオブジェクト。
 *                                各プロパティは`type`、`default`、`requiredByClass`、
 *                                およびオプションで`validator`を含む必要があります。
 *
 * 戻り値:
 *    - Object: データモデルクラス用の`props`オブジェクトで、各キーに対して
 *              `type`、`default`、`required`、およびオプションで`validator`を
 *              含むプロパティを返します。`required`プロパティは`requiredByClass`
 *              に基づいて設定されます。
 ****************************************************************************/
function generateClassProps(propsDefinition) {
  return Object.keys(propsDefinition).reduce((result, key) => {
    const {
      type,
      default: defaultValue,
      requiredByClass,
      validator,
    } = propsDefinition[key]
    result[key] = {
      type,
      default: defaultValue,
      required: requiredByClass || false,
    }
    if (validator) {
      result[key].validator = validator
    }
    return result
  }, {})
}

export { generateVueProps, generateClassProps }
