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
 * - version 1.0.0 - 2024-09-12 - 初版作成
 */
import GBtnRegistIcon from '../atoms/btns/GBtnRegistIcon.vue'
import GInputEmployeeContract from '../molecules/inputs/GInputEmployeeContract.vue'
import GDataTableEmployeeContracts from '../molecules/tables/GDataTableEmployeeContracts.vue'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import EmployeeContract from '~/models/EmployeeContract'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import Employee from '~/models/Employee'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTableEmployeeContracts,
    GBtnRegistIcon,
    GInputEmployeeContract,
    GDialogInput,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * 管理対象従業員のクラスインスタンス
     */
    instance: {
      type: Object,
      required: true,
      validator(instance) {
        return instance instanceof Employee
      },
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editModel: new EmployeeContract(),
      /**
       * DataTableに提供される配列です。`props.employeeId`で指定された従業員の
       * 雇用契約（EmployeeContract）ドキュメントが格納されます。
       */
      items: [],
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    hasNewContract() {
      if (!this.editModel.docId) return false
      if (!this.items.length) return false
      return this.items.some(
        ({ startDate }) => startDate > this.editModel.startDate
      )
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    dialog(v) {
      if (v && this.editMode === this.CREATE) {
        this.initializeForRegist()
      }
      if (!v) {
        this.editMode = this.CREATE
        this.editModel.initialize()
      }
    },
    /**
     * `props.instance.employeeId`を監視します。
     * - 従業員の雇用契約情報に対するリアルタイムリスナーをセットします。
     */
    'instance.docId': {
      handler(v) {
        if (!v) return
        this.items = this.instance.subscribeContracts()
      },
      immediate: true,
    },
    /**
     * `data.items`に対するwatcherです。
     * このコンポーネントが取得した雇用契約（EmployeeContract）ドキュメントの配列を
     * 親コンポーネントが参照できるように、`data.items`とともに`update:contracts`イベントをemitします。
     */
    items: {
      handler() {
        this.$emit('update:contracts', this.items)
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
    this.instance.unsubscribeContracts()
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
      this.editModel.initialize(item)
      this.editMode = this.UPDATE
      this.dialog = true
    },
    /****************************************************************************
     * 登録時の初期化処理を行います。
     * - itemsから最新の契約情報（startDateが最も新しいもの）を取得します。
     * - 最近の契約がない場合は、雇用日（hireDate）を開始日として設定します。
     * - 最近の契約が存在し、かつ期間がある場合は、終了日の翌日を新しい開始日として設定します。
     ****************************************************************************/
    initializeForRegist() {
      const recent = this.items.reduce(
        (last, item) =>
          !last || item.startDate > last.startDate ? item : last,
        null
      )

      // 最近の契約がない場合は雇用日（hireDate）を、期間がある場合は終了日の翌日を設定
      const startDate = recent
        ? recent.hasPeriod
          ? this.$dayjs(recent.expiredDate).add(1, 'day').format('YYYY-MM-DD')
          : ''
        : this.instance?.hireDate || ''

      // editModelにemployeeIdとstartDateを初期化して設定
      this.editModel.initialize({
        employeeId: this.instance.docId,
        startDate,
      })
    },
  },
}
</script>

<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-card-title class="g-card__title justify-space-between">
      <div>雇用契約</div>
      <g-dialog-input v-model="dialog">
        <template #activator="{ attrs, on }">
          <g-btn-regist-icon color="primary" v-bind="attrs" v-on="on" />
        </template>
        <template #default="{ attrs, on }">
          <g-input-employee-contract
            v-bind="attrs"
            :disable-edit="hasNewContract"
            :edit-mode="editMode"
            hide-employee
            :instance="editModel"
            v-on="on"
          />
        </template>
      </g-dialog-input>
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
