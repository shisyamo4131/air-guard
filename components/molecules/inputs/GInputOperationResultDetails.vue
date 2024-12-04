<script>
/**
 * OperationResultDetails入力コンポーネント
 *
 * `OperationResult` モデルの `workers` プロパティおよび `outsourcers` プロパティを編集するためのコンポーネントです。
 *
 * @author shisyamo4131
 * @version 1.2.0
 * @updates
 * - version 1.2.0 - 2024-10-04 - Added `disableEdit` property.
 * - version 1.1.0 - 2024-10-03 - `outsourcers` プロパティも編集・管理できるように機能を追加。
 *                              - コンポーネント名を `GInputOperationResultDetails` に変更。
 * - version 1.0.0 - 初版作成
 */
import GDialogInput from '../dialogs/GDialogInput.vue'
import GDataTableOperationResultDetails from '../tables/GDataTableOperationResultDetails.vue'
import GInputOperationResultWorker from './GInputOperationResultWorker.vue'
import GInputOperationResultOutsourcer from './GInputOperationResultOutsourcer.vue'
import GDataTable from '~/components/atoms/tables/GDataTable.vue'
import OperationResultWorker from '~/models/OperationResultWorker'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
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
    GDataTableOperationResultDetails,
  },
  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disableEdit: { type: Boolean, default: false, required: false },
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
  computed: {},
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
     * - 対象データが従業員の場合、`removeWorker` イベントを emit します。
     * - 対象データが外注先の場合、`removeOutsourcer` イベントを emit します。
     */
    onClickDelete(item) {
      const event = `remove${item.isEmployee ? 'Worker' : 'Outsourcer'}`
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
    <g-data-table-operation-result-details
      :disable-edit="disableEdit"
      :items="value"
      @click:edit="onClickRow"
      @click:delete="onClickDelete"
    />

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
