const props = {
  employeeId: { type: String, default: '', required: false },
  date: { type: String, default: '', required: false },
  startTime: { type: String, default: '', required: false },
  endTime: { type: String, default: '', required: false },
  endAtNextday: { type: Boolean, default: false, required: false },
  breakMinutes: { type: Number, default: null, required: false },
  workMinutes: { type: Number, default: null, required: false },
  overtimeMinutes: { type: Number, default: null, required: false },
  nighttimeMinutes: { type: Number, default: null, required: false },
  qualification: { type: Boolean, default: false, required: false },
  ojt: { type: Boolean, default: false, required: false },
  transportationCost: {
    type: Object,
    default: () => {
      return {
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
      }
    },
    required: false,
  },
}

export { props }
