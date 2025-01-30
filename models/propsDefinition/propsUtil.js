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
