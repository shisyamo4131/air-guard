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
    result[key] = { type, default: defaultValue, required: requiredByClass }
    if (validator) {
      result[key].validator = validator
    }
    return result
  }, {})
}

module.exports = { generateVueProps, generateClassProps }
