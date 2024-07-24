<script>
/**
 * ## GEmployeeContractsManager
 *
 * 従業員の雇用契約についてCRUD機能を提供するコンポーネントです。
 *
 * @events
 * @event contracts - `data.items`が更新されると、`data.items`とともにemitされます。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-24 - 初版作成
 */
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GDialogEditor from '../molecules/dialogs/GDialogEditor.vue'
import GInputEmployeeContract from '../molecules/inputs/GInputEmployeeContract.vue'
import GDataTableEmployeeContracts from '../molecules/tables/GDataTableEmployeeContracts.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableEmployeeContracts,
    GDialogEditor,
    GBtnRegistIcon,
    GInputEmployeeContract,
  },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象従業員のドキュメントIDです。
     */
    employeeId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * DataTableに提供される配列です。`props.employeeId`で指定された従業員の
       * 雇用契約（EmployeeContract）ドキュメントが格納されます。
       */
      items: [],
      /**
       * 雇用契約（EmployeeContracts）サブコレクションに対するリスナーです。
       * subscribeに必要な`employeeId`はwatcherで設定されます。
       */
      listener: this.$EmployeeContract(),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * GDialogEditorに引き渡す属性です。
     */
    editorAttrs() {
      return {
        ref: 'editor',
        defaultItem: { employeeId: this.employeeId },
        label: '雇用契約',
        maxWidth: '480',
        modelId: 'EmployeeContract',
      }
    },
    /**
     * コンポーネント内で使用する従業員（Employee）オブジェクトです。
     */
    employee() {
      if (!this.employeeId) return undefined
      return this.$store.getters['employees/get'](this.employeeId)
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * `props.employeeId`に対するwatcherです。
     * - `data.listener`に`employeeId`をセットし、雇用契約（EmployeeContracts）サブコレクションに対する購読を開始します。
     * - `data.employee`に従業員情報を読み込みます。
     */
    employeeId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return
        this.listener.employeeId = newVal
        this.items = this.listener.subscribe()
      },
      immediate: true,
    },
    /**
     * `data.items`に対するwatcherです。
     * このコンポーネントが取得した雇用契約（EmployeeContract）ドキュメントの配列を
     * 親コンポーネントが参照できるように、`data.items`とともに`contracts`イベントをemitします。
     */
    items: {
      handler() {
        this.$emit('contracts', this.items)
      },
      immediate: true,
      deep: true,
    },
  },
  /***************************************************************************
   * DESTROYED
   ***************************************************************************/
  destroyed() {
    /**
     * 雇用契約（EmployeeContracts）に対する購読を解除します。
     */
    this.listener.unsubscribe()
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 編集ボタンがクリックされた時の処理です。
     * - `editor`を`UPDATE`モードで開きます。
     */
    onClickEdit(item) {
      this.$refs.editor.open({ item, editMode: 'UPDATE' })
    },
    /**
     * 登録ボタンがクリックされた時の処理です。
     * - 雇用契約が存在しない場合、従業員の雇い入れ日を契約日の初期値としてエディタを開きます。
     * - 雇用契約が存在する場合、最新の雇用契約を参照し、契約期間の定めがある場合は満了日の翌日を
     *   契約日の初期値としてエディタを開きます。
     * - 契約期間の定めがない場合は契約日に初期値をセットせずにエディタを開きます。
     */
    onClickRegist() {
      const recent = this.items.reduce((last, item) => {
        return !last || item.startDate > last.startDate ? item : last
      }, null)
      if (!recent) {
        const startDate = this.employee?.hireDate || ''
        this.$refs.editor.open({ item: { startDate } })
      } else if (!recent.hasPeriod) {
        this.$refs.editor.open()
      } else {
        const startDate = this.$dayjs(recent.expiredDate)
          .add(1, 'day')
          .format('YYYY-MM-DD')
        this.$refs.editor.open({ item: { startDate } })
      }
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title justify-space-between">
      <div>雇用契約</div>
      <g-dialog-editor v-bind="editorAttrs">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon
            v-bind="attrs"
            color="primary"
            v-on="{ ...on, click: onClickRegist }"
          />
        </template>
        <template #default="{ attrs, on }">
          <g-input-employee-contract v-bind="attrs" v-on="on" />
        </template>
      </g-dialog-editor>
    </v-card-title>
    <v-container>
      <g-data-table-employee-contracts
        :actions="['edit']"
        :items="items"
        @click:edit="onClickEdit"
      />
    </v-container>
  </v-card>
</template>

<style></style>
