<script>
/**
 * OperationResultOutsourcers入力コンポーネント
 *
 * `OperationResult` モデルの `outsourcers` プロパティを編集するためのコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.0.0
 * @updates
 * - version 1.0.0 - 2024-10-02 - 初版作成
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GInputOperationResultOutsourcer from './GInputOperationResultOutsourcer.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import OperationResultOutsourcer from '~/models/OperationResultOutsourcer'
import GEditModeMixin from '~/mixins/GEditModeMixin'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: {
    GDataTable,
    GInputOperationResultOutsourcer,
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
      editModel: new OperationResultOutsourcer(),
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
            { text: '外注先', value: 'outsourcerId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
          ]
        case 'md':
          return [
            { text: '外注先', value: 'outsourcerId' },
            { text: '勤務日', value: 'date', align: 'center' },
            { text: '開始終了', value: 'startEnd', align: 'center' },
            { text: '休憩時間', value: 'breakMinutes', align: 'right' },
            { text: '実働時間', value: 'workMinutes', align: 'right' },
            { text: '残業時間', value: 'overtimeMinutes', align: 'right' },
          ]
        default:
          return [
            { text: '外注先', value: 'outsourcerId' },
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
     * 行がクリックされた時の処理です。
     * `editModel`を選択された稼働実績明細で初期化してダイアログを開きます。
     */
    onClickRow(item) {
      this.editModel.initialize(item)
      this.dialog = true
    },
    /**
     * `data.editModel`を`changeOutsourcer`イベントとともにemitします。
     */
    changeOutsourcer({ instance }) {
      this.$emit('changeOutsourcer', instance.clone())
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
      item-key="id"
      :actions="['edit', 'delete']"
      disable-sort
      @click:edit="onClickRow"
      @click:delete="$emit('removeOutsourcer', $event)"
    >
      <template #[`item.outsourcerId`]="{ item }">
        {{
          $store.getters[`outsourcers/get`](item.outsourcerId)?.abbr ||
          'undefined'
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
      <template #default="{ attrs }">
        <g-input-operation-result-outsourcer
          v-bind="attrs"
          :instance="editModel"
          :edit-mode="UPDATE"
          @submit:complete="changeOutsourcer"
          @click:cancel="dialog = false"
        />
      </template>
    </g-dialog-input>
  </div>
</template>

<style></style>
