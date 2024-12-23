export const allNavList = [
  {
    name: 'TOP',
    icon: 'mdi-home',
    to: '/',
    lists: [],
  },
  {
    name: '管制業務',
    icon: 'mdi-camera-control',
    lists: [
      { name: '配置管理', to: '/placements', icon: 'mdi-table-account' },
      {
        name: '休暇申請管理',
        to: '/employee-leave-applications',
        icon: 'mdi-beach',
      },
      {
        name: '稼働予定管理',
        to: '/site-operation-schedules',
        icon: 'mdi-calendar-clock',
      },
      {
        name: '稼働実績',
        to: '/operation-results',
        icon: 'mdi-table-edit',
      },
      {
        name: '勤怠実績',
        to: '/monthly-attendances',
        icon: 'mdi-calendar-clock',
      },
    ],
  },
  {
    name: '人事管理',
    icon: 'mdi-account-group',
    lists: [
      {
        name: '雇用保険',
        to: '/employment-insurances',
        icon: 'mdi-shield-account',
      },
      {
        name: '健康保険',
        to: '/health-insurances',
        icon: 'mdi-hospital-box',
      },
      {
        name: '厚生年金',
        to: '/pensions',
        icon: 'mdi-currency-jpy',
      },
    ],
  },
  {
    name: '経理業務',
    icon: 'mdi-calculator-variant-outline',
    lists: [
      {
        name: '稼働請求',
        to: '/operation-billing-bases',
        icon: 'mdi-currency-jpy',
      },
      {
        name: '交通費管理',
        to: '/transportation-cost-applications',
        icon: 'mdi-train-bus',
      },
      {
        name: '請求処理',
        to: '/monthly-billings',
        icon: 'mdi-file-document',
      },
    ],
  },
  {
    name: '月次売上',
    icon: 'mdi-train-bus',
    to: '/monthly-sales',
    lists: [],
  },
  {
    name: 'マスタ管理',
    icon: 'mdi-cube',
    lists: [
      { name: '取引先', to: '/customers', icon: 'mdi-domain' },
      { name: '現場', to: '/sites', icon: 'mdi-domain' },
      { name: '従業員', to: '/employees', icon: 'mdi-domain' },
      { name: '外注先', to: '/outsourcers', icon: 'mdi-domain' },
      { name: '制服・装備品', to: '/equipments', icon: 'mdi-domain' },
      { name: '手当', to: '/allowances', icon: 'mdi-domain' },
    ],
  },
  {
    name: '同期設定',
    icon: 'mdi-wrench-cog',
    lists: [
      {
        name: '取引先同期設定',
        to: '/synchronize/customers',
        alertGetter: 'hasCustomerAlerts',
      },
      {
        name: '現場同期設定',
        to: '/synchronize/sites',
        alertGetter: 'hasSiteAlerts',
      },
      {
        name: '従業員同期設定',
        to: '/synchronize/employees',
        alertGetter: 'hasEmployeeAlerts',
      },
      { name: '外注先同期設定', to: '/synchronize/outsourcers' },
    ],
    alertGetter: 'hasAnyAlerts',
  },
  {
    name: '設定・管理',
    icon: 'mdi-wrench-cog',
    lists: [
      {
        name: 'アプリ設定',
        to: '/settings',
        icon: 'mdi-wrench-cog',
      },
      {
        name: 'ユーザー管理',
        to: '/admin/users',
        icon: 'mdi-account',
      },
      {
        name: '祝日設定',
        to: '/holidays',
        icon: 'mdi-flag',
      },
      {
        name: '就業規則',
        to: '/admin/work-regulations',
      },
      { name: '自動採番', to: '/admin/autonumbers' },
      { name: 'マスタインポート', to: '/admin/import-masters' },
      {
        name: 'トランザクションインポート',
        to: '/admin/import-transactions',
      },
      {
        name: 'システムメンテナンス',
        to: '/admin/maintenance',
      },
    ],
  },
  {
    name: '開発',
    icon: 'mdi-wrench-cog',
    lists: [
      { name: 'モデル－インプット', to: '/developments/model-input' },
      { name: 'コンポーネントテスト', to: '/developments/sandbox' },
    ],
  },
]
