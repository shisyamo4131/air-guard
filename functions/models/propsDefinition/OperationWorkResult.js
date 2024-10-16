import { generateVueProps, generateClassProps } from './propsUtil.js'

const propsDefinition = {
  operationResultId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
  siteId: {
    type: String,
    default: '',
    required: false,
    requiredByClass: true,
  },
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

const vueProps = generateVueProps(propsDefinition)
const classProps = generateClassProps(propsDefinition)

export { vueProps, classProps }
