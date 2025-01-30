/**
 * 従業員勤怠実績ドキュメント定義
 * - 稼働実績ドキュメントから複製して生成されるドキュメントです。
 * - 従業員の勤怠実績として扱われます。
 * - ドキュメントの定義内容はその多くを、OperationResultWorker から継承します。
 * @refact 2025-01-30
 */
import { generateProps } from './propsUtil'
import { propsDefinition as sourceProps } from './OperationResultWorker'
/*****************************************************************************
 * PROPERTIES
 *****************************************************************************/
const propsDefinition = {
  // OpeationResultWorker のドキュメント定義を拡張
  ...sourceProps,

  /**
   * 稼働実績ID
   * - 当該ドキュメントのソースとなる稼働実績ドキュメントの ID
   */
  operationResultId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 現場ID
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },

  // 交通費申請
  transportationCost: {
    type: String,
    default: {
      type: 'on-cash',
      amount: 0,
      status: '0:creating',
      createAt: null,
      draftAt: null,
      pendingAt: null,
      approvedAt: null,
      settledAt: null,
      rejectedAt: null,
      rejectReason: '',
      updateAt: null,
    },
    required: false,
    requiredByClass: true,
  },
}

const { vueProps, classProps } = generateProps(propsDefinition)

export { vueProps, classProps }
