<script>
/**
 * OperationResultDetails入力コンポーネント
 *
 * `OperationResult` モデルの `workers` プロパティおよび `outsourcers` プロパティを編集するためのコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.1.0
 * @updates
 * - version 1.1.0 - 2024-10-03 - `outsourcers` プロパティも編集・管理できるように機能を追加。
 *                              - コンポーネント名を `GInputOperationResultDetails` に変更。
 * - version 1.0.0 - 初版作成
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputOperationResultWorker from './GInputOperationResultWorker.vue'
import GInputOperationResultOutsourcer from './GInputOperationResultOutsourcer.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
import GEditModeMixin from '~/mixins/GEditModeMixin'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GInputOperationResultWorker,
    GDialogInput,
    GInputOperationResultOutsourcer,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GEditModeMixin],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    value: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editModel: new OperationResultWorker(),
      inputComponent: 'GInputOperationResultWorker',
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * 稼働実績明細テーブルのカラム定義です。
     */
    headers() {
      switch (this.$vuetify.breakpoint.name) {
        case 'sm':
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          ]
        case 'md':
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
          ]
        default:
          return [
            { text: '氏名', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
            { text: '深夜時間', value: 'nighttimeMinutes', align: 'right' },
          ]
      }
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * `dialog`を監視します。
     * `dialog`が閉じたら`editModel`を初期化します。
     */
    dialog(v) {
      if (v) return
      this.editModel.initialize()
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 編集アイコンがクリックされた時の処理です。
     * `editModel` を選択された稼働実績明細で初期化して編集画面を開きます。
     * - 編集画面に表示されるコンポーネントを `item.isEmployee` プロパティに応じて変更します。
     * - `item.isEmployee` プロパティに応じて `editModel` に対応するインスタンスをセットします。
     */
    onClickRow(item) {
      if (item.isEmployee) {
        this.inputComponent = 'GInputOperationResultWorker'
        this.editModel = new OperationResultWorker(item)
      } else {
        this.inputComponent = 'GInputOperationResultOutsourcer'
        this.editModel = new OperationResultOutsourcer(item)
      }
      this.dialog = true
    },
    /**
     * 編集画面の `submit:complete` イベントでコールされます。
     * - 対象データが従業員の場合、`changeWorder` イベントを emit します。
     * - 対象データが外注先の場合、`changeOutsourcer` イベントを emit します。
     * - `dialog` を false にします。
     */
    onSubmitComplete({ instance }) {
      const event = `change${instance.isEmployee ? 'Worker' : 'Outsourcer'}`
      this.$emit(event, instance.clone())
      this.dialog = false
    },
    /**
     * 削除アイコンがクリックされた時の処理です。
     * - 対象データが従業員の場合、`removeWorder` イベントを emit します。
     * - 対象データが外注先の場合、`removeOutsourcer` イベントを emit します。
     */
    onClickDelete(item) {
      const event = `remove${item.isEmployee ? 'Worder' : 'Outsourcer'}`
      this.$emit(event, item)
    },
  },
}
</script>

<template>
  <div>
    <v-skeleton-loader
      v-if="loading"
      type="table-tbody"
      :types="{ 'table-tbody': `table-row-divider@${value.length || '1'}` }"
    />
    <g-data-table
      v-else
      :headers="headers"
      :items="value"
      item-key="id"
      :actions="['edit', 'delete']"
      disable-sort
      @click:edit="onClickRow"
      @click:delete="onClickDelete"
    >
      <template #[`item.employeeId`]="{ item }">
        <div v-if="item.employeeId">
          {{
            $store.getters[`employees/get`](item.employeeId)?.abbr ||
            'undefined'
          }}
        </div>
        <div v-else>
          {{
            $store.getters[`outsourcers/get`](item.outsourcerId)?.abbr ||
            'undefined'
          }}
        </div>
      </template>
      <template #[`item.date`]="{ item }">
        {{ item.date.slice(5) }}
      </template>
      <template #[`item.startEnd`]="{ item }">
        <div>{{ item.startTime }}</div>
        <div>{{ item.endTime }}</div>
      </template>
      <template #[`item.breakMinutes`]="{ item }">
        {{ `${item.breakMinutes} 分` }}
      </template>
      <template #[`item.workMinutes`]="{ item }">
        {{ `${item.workMinutes} 分` }}
      </template>
      <template #[`item.overtimeMinutes`]="{ item }">
        {{ `${item.overtimeMinutes} 分` }}
      </template>
      <template #[`item.nighttimeMinutes`]="{ item }">
        {{ `${item.nighttimeMinutes} 分` }}
      </template>
    </g-data-table>

    <g-dialog-input v-model="dialog" max-width="480">
      <template #default="{ attrs }">
        <component
          :is="inputComponent"
          v-bind="attrs"
          :instance="editModel"
          :edit-mode="UPDATE"
          @submit:complete="onSubmitComplete"
          @click:cancel="dialog = false"
        />
      </template>
    </g-dialog-input>
  </div>
</template>

<style></style>
