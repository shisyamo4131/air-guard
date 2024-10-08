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
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-10-08 - 雇用契約が連続した状態になるように、各種制御を追加
 * - version 1.1.0 - 2024-10-07 - `computed.hasNewContract` を実装し、GInputEmployeeContract の disable-edit にバインド
 *                              - `computed.allowedDates` を実装し、GInputEmployeeContract の allowed-dates にバインド
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
    /**
     * `editMode` が `CREATE` の際に影響するプロパティです。
     * 雇用契約の新規作成時に、`startDate` として選択可能な日を制限します。
     *
     * 従業員の雇用契約は連続した状態でなければならないため、`startDate` は直近の雇用契約を参照した上で
     * 初期値が設定されるようになっていますが、直近の雇用契約に契約期間の定めがない場合、初期値が設定されません。
     * このケースでは、`startDate` に直帰の雇用契約の契約日以前が設定されることを避ける必要があります。
     * また、直近の雇用契約が存在しない場合は雇い入れ日（Employee.hireDate）以降で制限しています。
     * -> 雇い入れ日で固定すべきなので、更に、`data.items` 配列が空である場合、GInputEmployeeContract の disable-start-date プロパティが
     *    true になるようにしています。
     */
    allowedDates() {
      if (!this.items.length) {
        return (v) => v >= this.instance.hireDate // 雇用開始日以上なら許可
      } else {
        const recent = this.items.reduce(
          (last, item) => (item.startDate > last.startDate ? item : last),
          this.items[0]
        ) // 初期値を明示的に最初の要素に設定

        return (v) => v > recent.startDate // 最近の開始日より後の日付を許可
      }
    },
    /**
     * `editMode` が `UPDATE` の際に影響するプロパティです。
     * `editModel` の `startDate` よりも後の雇用契約が存在するかどうかを返します。
     *
     * EmployeeContracts ドキュメントの docId が `${employeeId}-${startDate}` で固定されるため、
     * `editMode` が `UPDATE` のときは `startDate` の編集を不可能にしていますが、契約満了日である `expiredDate` は編集可能です。
     * より新しい雇用契約が存在する際に、`expiredDate` が更新されてしまうと、従業員の雇用契約が連続した状態にならなくなってしまう可能性があります。
     *
     * このプロパティを、GInputEmployeeContract コンポーネントの disabled プロパティとバインドすることにより、
     * 雇用契約の不整合を回避します。
     */
    hasNewContract() {
      if (!this.editModel.docId || !this.items.length) return false

      // `startDate` が `editModel.startDate` よりも後の契約があるか確認
      return this.items.some(
        ({ startDate }) => startDate > this.editModel.startDate
      )
    },
    /**
     * `editMode` が `CREATE` の際に影響するプロパティです。
     * `editModel` の `startDate` よりも前に契約された直近の雇用契約に期間の定めがあるかどうか (`hasPeriod` が true か) を返します。
     *
     * 期間の定めがある直近の雇用契約が既に登録されている場合、`methods.initializeForRegist` で `editModel.startDate` が
     * 契約満了日である `expiredDate` の翌日に設定されます。
     * 従業員の雇用契約は必ず連続した状態でなければならず、新しい雇用契約を作成する際に `editModel.startDate` が
     * ユーザーにより編集されてしまうことを避けなければなりません。
     *
     * 尚、EmployeeContracts ドキュメントの docId は `${employeeId}-${startDate}` で固定されるため、編集時に `startDate` は変更できません。
     *
     * - `editModel.startDate` または `items` が存在しない場合は `false` を返します。
     * - `items` の中から、`editModel.startDate` よりも前に開始された契約を
     *   `reduce` を使ってループし、最も開始日が近い契約を見つけます。
     * - 見つかった契約 (`recent`) が存在し、かつ `hasPeriod` が true の場合に `true` を返します。
     *
     * @returns {boolean} `editModel.startDate` より前に期間の定めがある契約が存在する場合は `true`、そうでなければ `false`
     */
    hasPriorContractWithPeriod() {
      // editModel の startDate または items がない場合は false を返す
      if (!this.editModel.startDate || !this.items.length) return false

      // 最も直近の契約を取得 (startDate が editModel.startDate よりも前)
      const recent = this.items.reduce(
        (last, item) =>
          item.startDate < this.editModel.startDate &&
          (!last || item.startDate > last.startDate)
            ? item
            : last,
        null
      )

      // recent が存在し、かつ hasPeriod が true の場合に true を返す
      return recent && recent.hasPeriod
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
            :allowed-dates="allowedDates"
            :disable-edit="hasNewContract"
            :disable-start-date="hasPriorContractWithPeriod || !items.length"
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
