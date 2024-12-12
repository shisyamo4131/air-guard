import dayjs from 'dayjs'

/**
 * Access版AirGuardからAPIによって送られてきたデータを変換するためのマッピング定義です。
 */
export const mappingDefinitions = {
  collectionMapping: {
    t_取引先: 'Customers',
    t_現場: 'Sites',
    t_従業員: 'Employees',
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
    t_現場: {
      現場cd: { mappedTo: 'code' },
      現場名: { mappedTo: 'name' },
      現場名略称: { mappedTo: 'abbr' },
      フリガナ: { mappedTo: 'abbrKana' },
      住所: { mappedTo: 'address' },
      取引先cd: { mappedTo: 'customerCode' },
      警備種別: {
        mappedTo: 'securityType',
        transformation: (data) => {
          switch (data['警備種別']) {
            case 1:
              return 'current-traning'
            case 2:
              return 'facility'
            case 3:
              return 'traffic'
            case 4:
              return 'jam'
            case 5:
              return 'patrol'
            case 6:
              return 'newly-traning'
            case 7:
              return 'newly-extra-traing'
            case 8:
              return 'control'
            default:
              return 'other'
          }
        },
      },
    },
    t_従業員: {
      従業員Id: { mappedTo: 'code' },
      苗字: { mappedTo: 'lastName' },
      名前: { mappedTo: 'firstName' },
      苗字カナ: { mappedTo: 'lastNameKana' },
      名前カナ: { mappedTo: 'firstNameKana' },
      生年月日: {
        mappedTo: 'birth',
        transformation: (data) => {
          return dayjs(data['生年月日']).format('YYYY-MM-DD')
        },
      },
      性別: {
        mappedTo: 'gender',
        transformation: (data) => {
          return data['性別'] === 1 ? 'male' : 'female'
        },
      },
      郵便番号: { mappedTo: 'zipcode' },
      都道府県: {
        mappedTo: 'address1',
        transformation: (data) =>
          `${data['都道府県']}${data['市区町村']}${data['番地']}`,
      },
      建物: { mappedTo: 'address2' },
      電話番号: { mappedTo: 'tel' },
      携帯電話: { mappedTo: 'mobile' },
      入社年月日: {
        mappedTo: 'hireDate',
        transformation: (data) => {
          return dayjs(data['入社年月日']).format('YYYY-MM-DD')
        },
      },
      退職年月日: {
        mappedTo: 'leaveDate',
        transformation: (data) => {
          return data['退職年月日']
            ? dayjs(data['退職年月日']).format('YYYY-MM-DD')
            : null
        },
      },
      外国人: { mappedTo: 'isForeigner' },
      血液型: {
        mappedTo: 'bloodType',
        transformation: (data) => {
          switch (data['血液型']) {
            case 1:
              return 'A'
            case 2:
              return 'B'
            case 3:
              return 'AB'
            case 4:
              return 'O'
            default:
              return null
          }
        },
      },
      送付先住所区分: { mappedTo: 'hasSendAddress' },
      送付先郵便番号: { mappedTo: 'sendZipcode' },
      送付先住所1: { mappedTo: 'sendAddress1' },
      送付先住所2: { mappedTo: 'sendAddress2' },
      警備員登録日: {
        mappedTo: 'registrationDate',
        transformation: (data) => {
          return data['警備員登録日']
            ? dayjs(data['警備員登録日']).format('YYYY-MM-DD')
            : null
        },
      },
      警備経験開始日: {
        mappedTo: 'securityStartDate',
        transformation: (data) => {
          return data['警備経験開始日']
            ? dayjs(data['警備経験開始日']).format('YYYY-MM-DD')
            : null
        },
      },
      ブランク: { mappedTo: 'blankMonths' },
    },
  },
  hooks: {
    t_取引先: (mappedData, originalData) => {
      // Access版に契約状態が存在しないため、すべて `active` で取り込む
      mappedData.status = 'active'
      return mappedData
    },
    t_現場: (mappedData, originalData) => {
      mappedData.status = originalData['稼働状況'] === 1 ? 'active' : 'expired'
      return mappedData
    },
    t_従業員: (mappedData, originalData) => {
      const abbr = `${originalData['苗字']} ${originalData['名前']}`
      mappedData.abbr = abbr.slice(0, 5)
      mappedData.status = originalData['退職年月日'] ? 'expired' : 'active'
      mappedData.nationality = originalData['外国人'] ? null : '日本'
      return mappedData
    },
  },
}
