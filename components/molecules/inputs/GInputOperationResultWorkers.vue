<script>
/**
 * OperationResultWorkers入力コンポーネント
 *
 * `OperationResult` モデルの `workers` プロパティを編集するためのコンポーネントです。
 *
 * 注意事項:
 *   `props.value`に与えられた稼働実績明細に存在する従業員IDについて、Vuexの`employees/loadTemporary`をコールします。
 * - 当該コンポーネントが繰り返し読み込まれる可能性があるため、`employees/clearTemporary`はコールしません。
 * - 稼働実績明細を追加する機能は保有していません。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 初版作成
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputOperationResultWorker from './GInputOperationResultWorker.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
import GEditModeMixin from '~/mixins/GEditModeMixin'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GInputOperationResultWorker,
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
    value: { type: Array, default: () => [], required: false },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editModel: new OperationResultWorker(),
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
            { text: '従業員', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          ]
        case 'md':
          return [
            { text: '従業員', value: 'employeeId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
          ]
        default:
          return [
            { text: '従業員', value: 'employeeId' },
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
    /**
     * `value`を監視します。
     * `value`から`employeeId`を抽出し、Vuexの`loadTemporary`を呼び出します。
     * `value`内にある`employeeId`の従業員情報がすべてVuexに読み込まれます。
     */
    value: {
      async handler(v) {
        this.loading = true
        try {
          const employeeIds = v.map(({ employeeId }) => employeeId)
          await this.$store.dispatch('employees/loadTemporary', {
            docIds: employeeIds,
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`watch.value でエラーが発生しました。:`, err)
          alert(err.message)
        } finally {
          this.loading = false
        }
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * 行がクリックされた時の処理です。
     * `editModel`を選択された稼働実績明細で初期化してダイアログを開きます。
     */
    onClickRow(item) {
      this.editModel.initialize(item)
      this.dialog = true
    },
    /**
     * `data.editModel`を`changeWorker`イベントとともにemitします。
     */
    changeWorker({ instance }) {
      this.$emit('changeWorker', instance.clone())
      this.dialog = false
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
      item-key="employeeId"
      :actions="['edit', 'delete']"
      disable-sort
      @click:edit="onClickRow"
      @click:delete="$emit('removeWorker', $event)"
    >
      <template #[`item.employeeId`]="{ item }">
        {{
          $store.getters[`employees/get`](item.employeeId)?.abbr || 'undefined'
        }}
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
      <g-input-operation-result-worker
        :instance="editModel"
        :edit-mode="UPDATE"
        @submit:complete="changeWorker"
        @click:cancel="dialog = false"
      />
    </g-dialog-input>
  </div>
</template>

<style></style>
