/**
 * Access版AirGuardからAPIによって送られてきたデータを変換するためのマッピング定義です。
 */
export const mappingDefinitions = {
  collectionMapping: {
    t_取引先: 'Customers',
  },
  fieldMappings: {
    t_取引先: {
      取引先cd: { mappedTo: 'code' },
      取引先名1: {
        mappedTo: 'name1',
        transformation: (data) => {
          if (data['法人格位置'] === 1) {
            return `${data['法人格']}${data['取引先名1']}`
          } else if (data['法人格位置'] === 2) {
            return `${data['取引先名1']}${data['法人格']}`
          } else {
            return data['取引先名1']
          }
        },
      },
      取引先名2: { mappedTo: 'name2' },
      取引先名略称: { mappedTo: 'abbr' },
      フリガナ: { mappedTo: 'abbrKana' },
      郵便番号: { mappedTo: 'zipcode' },
      都道府県: {
        mappedTo: 'address1',
        transformation: (data) =>
          `${data['都道府県']}${data['市区町村']}${data['番地']}`,
      },
      建物: { mappedTo: 'address2' },
      電話番号: { mappedTo: 'tel' },
      FAX番号: { mappedTo: 'fax' },
      請求締日: {
        mappedTo: 'deadline',
        transformation: (data) => {
          const closingDate = data['請求締日']
          return closingDate === 30
            ? '99'
            : closingDate.toString().padStart(2, '0')
        },
      },
      入金予定日_月: { mappedTo: 'depositMonth' },
      入金予定日_日: {
        mappedTo: 'depositDate',
        transformation: (data) => {
          const closingDate = data['入金予定日_日']
          return closingDate === 30
            ? '99'
            : closingDate.toString().padStart(2, '0')
        },
      },
      備考: { mappedTo: 'remarks' },
    },
  },
  hooks: {
    t_取引先: (mappedData, originalData) => {
      mappedData.status =
        originalData['論理削除区分'] === '0' ? 'active' : 'expired'
      return mappedData
    },
  },
}
