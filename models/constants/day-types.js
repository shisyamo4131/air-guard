/**
 * 定数定義: 日区分
 */

// Vuetify のカラー定義をインポート
import colors from 'vuetify/es5/util/colors'

export const DAY_TYPE = Object.freeze({
  undefined: {
    short: '不明',
    full: '不明',
    type: 'undefined',
    color: colors.grey.darken1,
  },
  scheduled: {
    short: '所定',
    full: '所定労働日',
    type: 'workday',
    color: colors.blue.lighten2,
  },
  'non-statutory-holiday': {
    short: '法外',
    full: '法定外休日',
    type: 'holiday',
    color: colors.green.lighten2,
  },
  'legal-holiday': {
    short: '法休',
    full: '法定休日',
    type: 'holiday',
    color: colors.red.lighten2,
  },
})

export const DAY_TYPE_ARRAY = Object.entries(DAY_TYPE).map(([key, value]) => {
  return { value: key, text: value.full, color: value.color }
})
