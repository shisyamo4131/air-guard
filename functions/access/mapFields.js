import { mappingDefinitions } from './mappingDefinitions.js'

/**
 * 日本語フィールド名を英語フィールド名にマッピングし、変換を適用する
 * @param {Object} data - APIから送られてきたJSONデータの `data` 部分
 * @param {string} type - テーブル名（例: "t_取引先"）
 * @returns {Object} - マッピングと変換後のオブジェクト
 */
export function mapFieldsToEnglish(data, type) {
  const { fieldMappings, hooks } = mappingDefinitions

  if (!fieldMappings[type]) {
    return {} // マッピングが存在しない場合は空オブジェクトを返す
  }

  const mapping = fieldMappings[type]
  const mappedData = {}

  // マッピング定義に基づいてフィールドを変換
  for (const [key, value] of Object.entries(data)) {
    if (mapping[key]) {
      const { mappedTo, transformation } = mapping[key]
      mappedData[mappedTo] = transformation ? transformation(data) : value
    }
  }

  // フック関数を適用
  if (hooks[type]) {
    return hooks[type](mappedData, data)
  }

  return mappedData
}

/**
 * テーブル名をFirestoreのコレクション名にマッピングする
 * @param {string} type - 日本語のテーブル名（例: "t_取引先"）
 * @returns {string} - Firestoreのコレクション名（例: "customers"）
 */
export function mapTableToCollection(type) {
  const { collectionMapping } = mappingDefinitions
  return collectionMapping[type] || type
}
