<script>
/**
 * GTemplateIndex を拡張した、複数の Firestore ドキュメントの表示と編集を行うための
 * コンポーネントです。
 *
 * - 登録ボタンをクリックすると input スロットに配置されたコンポーネントをダイアログで表示します。
 *
 * [NOTE]
 * Firestore への更新処理の役割をこのコンポーネントに持たせてることは NG とする。
 * - このコンポーネントを利用せずに Firestore への更新処理が必要になる機能が存在する場合など、
 *   更新処理自体が独立した状態が好ましい。
 *
 * @author shisyamo4131
 */
import { FireModel } from 'air-firebase'
import GDialogInput from '../molecules/dialogs/GDialogInput.vue'
import GTemplateIndex from './GTemplateIndex.vue'
import GMixinEditModeProvider from '~/mixins/GMixinEditModeProvider'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GTemplateIndex, GDialogInput },

  /***************************************************************************
   * MIXINS
   ***************************************************************************/
  mixins: [GMixinEditModeProvider],

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * instance に適用する初期値です。
     * コンポーネントが初期化される際に instance に反映されます。
     */
    defaultItem: { type: Object, default: () => {}, required: false },

    /**
     * ダイアログの開閉状態です。
     * .sync 修飾子とともに利用可能です。
     */
    dialog: { type: Boolean, default: false, required: false },

    /**
     * ダイアログコンポーネントに引き渡されるオプションです。
     * - ダイアログの幅（max-width）など、コンポーネントごとの個別の設定を定義します。
     */
    dialogProps: {
      type: Object,
      default: () => ({}),
      required: false,
    },

    /**
     * 編集画面ダイアログを編集モード `UPDATE` で開くトリガーとなるイベント名です。
     * - 既定値は `click:row` です。
     * - 指定されたイベントは編集対象のオブジェクトを第1ペイロードに含む必要があります。
     */
    editEvent: { type: String, default: 'click:row', required: false },

    /**
     * editEvent で指定したイベントでの処理を上書きします。
     * - 既定ではダイアログを編集モード `UPDATE` で開きます。
     * - 別のページに遷移するなど、既定の処理を上書きします。
     * - 編集対象オブジェクトが第1ペイロードに含まれます。
     */
    editEventHandler: {
      type: Function,
      default: undefined,
      required: false,
    },

    /**
     * 管理対象となる FireModel を継承したクラスインスタンス
     */
    instance: {
      type: Object,
      validator: (instance) => instance instanceof FireModel,
      required: true,
    },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * ダイアログの開閉状態を管理するための内部変数です。
       */
      internalDialog: false,
    }
  },

  computed: {
    hasInputSlot() {
      return !!this.$scopedSlots.input || !!this.$slots.input
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * dialog の値を internalDialog と同期します。
     */
    dialog: {
      handler(v) {
        this.internalDialog = v
      },
      immediate: true,
    },

    /**
     * ダイアログの終了とともにインスタンス、編集モードの初期化を行います。
     * また、update:dialog イベントで internalDialog の値を emit します。
     */
    internalDialog(v) {
      if (!v) this.initialize()
      this.$emit('update:dialog', v)
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントの初期化を行います。
     * - ダイアログを閉じます。
     * - instance の initialize メソッドを実行します。
     * - 編集モードを `CREATE` に初期化します。
     * instance の初期化時には defaultItem が適用されます。
     */
    initialize() {
      this.internalDialog = false
      this.instance.initialize({ ...this.defaultItem })
      this.editMode = this.CREATE
    },

    /**
     * 指定された編集モードでダイアログを開きます。
     * - コンポーネント外部から強制的にダイアログを開くためのメソッドです。
     * @param {string} [editMode='CREATE'] - 編集モードです。
     * @param {Object} [item={}] - インスタンスに適用する初期値です。
     */
    openDialog({ editMode = 'CREATE', item = {} } = {}) {
      this.editMode = editMode
      this.instance.initialize({ ...this.defaultItem, ...item })
      this.internalDialog = true
    },

    /**
     * [PRIVATE]
     * 登録ボタンがクリックされた時の処理です。
     * - openDialog メソッドを実行します。
     * - `click:regist` イベントを emit します。
     */
    _onClickRegist() {
      this.openDialog()
      this.$emit('click:regist')
    },

    /**
     * [PRIVATE]
     * editEvent で指定されたイベントの処理です。
     * - editEventHandler が指定されていた場合はこれを実行します。
     * - それ以外は編集画面ダイアログを編集モード `UPDATE` で開きます。
     */
    _internalEditEventHandler(item) {
      if (this.editEventHandler) {
        this.editEventHandler(item)
      } else {
        this.openDialog({ editMode: 'UPDATE', item })
      }
    },
  },
}
</script>

<template>
  <g-template-index
    v-bind="$attrs"
    @click:regist="openDialog"
    v-on="$listeners"
  >
    <!-- GTempleteIndex が提供するスロットをレンダリング -->
    <template
      v-for="(_, scopedSlotName) in $scopedSlots"
      #[scopedSlotName]="slotData"
    >
      <slot :name="scopedSlotName" v-bind="slotData" />
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]>
      <slot :name="slotName" />
    </template>

    <!-- default スロットのレンダリングを上書き -->
    <template #default="props">
      <slot
        name="default"
        v-bind="{
          ...props,
          on: {
            ...props.on,
            [editEvent]: _internalEditEventHandler,
          },
        }"
      />
      <g-dialog-input
        v-if="hasInputSlot"
        v-model="internalDialog"
        v-bind="{ ...dialogProps }"
        :edit-mode.sync="editMode"
        :instance="instance"
      >
        <template #default="{ attrs, on }">
          <slot name="input" v-bind="{ attrs, on }" />
        </template>
      </g-dialog-input>
    </template>
  </g-template-index>
</template>

<style></style>
