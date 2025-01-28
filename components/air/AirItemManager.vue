<script>
/**
 * AirRenderlessItemManager を拡張したオブジェクト管理用コンポーネントです。
 * - アイテムを編集するためのダイアログを内包しています。
 * @author shisyamo4131
 * @refact 2025-01-16
 */
import AirRenderlessItemManager from './AirRenderlessItemManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirRenderlessItemManager },

  /***************************************************************************
   * MODEL
   ***************************************************************************/
  model: { prop: 'item', event: 'input' },

  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    /**
     * コンポーネントのカラーです。
     */
    color: { type: String, default: 'primary', required: false },

    /**
     * ダイアログに引き渡すプロパティです。
     */
    dialogProps: {
      type: Object,
      default: () => ({}),
      required: false,
    },

    /**
     * 削除指示ができなくなります。
     */
    disableDelete: { type: Boolean, default: false, required: false },

    /**
     * アイテムの削除開始トリガーとなるイベントの名前です。
     */
    eventDelete: { type: String, default: 'click:delete', required: false },

    /**
     * アイテムの編集開始トリガーとなるイベントの名前です。
     */
    eventEdit: { type: String, default: 'click:edit', required: false },

    /**
     * コンポーネントの高さです。
     */
    height: { type: [String, Number], default: 'auto', required: false },

    /**
     * 編集対象のアイテム（オブジェクト）です。
     * オブジェクトのデータ構造を表すスキーマとしても使用されます。
     */
    item: { type: Object, default: () => ({}), required: false },

    /**
     * カードコンポーネントのタイトルとして引き渡されます。
     */
    label: { type: String, default: 'default label', required: false },

    /**
     * コンポーネントが処理中であることを表します。
     * - .sync 修飾子が利用可能です。
     */
    loading: { type: Boolean, default: false, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * VDialog 制御用の変数です。
       * - 枠外をクリックされたなどして VDialog が終了した場合に、AirRenderlessItemManagerの
       *   isEditing プロパティを同期させるために使用します。
       */
      dialog: false,

      /**
       * VDialog への参照です。
       */
      dialogRef: null,

      /**
       * card スロットに配置されたコンポーネントへの参照です。
       */
      cardRef: null,

      /**
       * form スロットに配置されたコンポーネントへの参照です。
       */
      formRef: null,

      /**
       * コンポーネント内部で管理する、処理中であるかどうかを表すプロパティです。
       */
      internalLoading: false,

      /**
       * AirRenderlessItemManager への参照です。
       */
      managerRef: null,

      /**
       * card スロットに配置されたコンポーネント内の `.v-card__text` クラスを持つ
       * エレメントの配列です。
       * VDialog の終了時にスクロール位置を初期化するために使用します。
       */
      scrollTargets: [],
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * キャンセルボタンにバインドするオブジェクトを返します。
     */
    btnCancelProps() {
      return {
        attrs: {
          disabled: this.computedLoading,
        },
        on: {
          click: this.onClickCancel,
        },
        icon: 'mdi-close',
      }
    },

    /**
     * 確定ボタンにバインドするオブジェクトを返します。
     */
    btnSubmitProps() {
      return {
        attrs: {
          color: this.color,
          disabled: this.computedLoading,
          loading: this.computedLoading,
        },
        on: {
          click: this.onClickSubmit,
        },
        icon: 'mdi-check',
        label: '確定',
      }
    },

    /**
     * card スロットで提供するプロパティを返します。
     */
    cardSlotProps() {
      return {
        attrs: {
          ref: (el) => (this.cardRef = el),
          item: this.managerRef?.editItem || {},
          editMode: this.managerRef?.editMode || undefined,
        },
        on: {
          cancel: this.onClickCancel,
          submit: this.submit,
        },
        color: this.color,
        label: this.label,
        inputs: this.inputsSlotProps,
        loading: this.computedLoading,
      }
    },

    /**
     * コンポーネントのルートに適用する height を返します。
     */
    computedHeight() {
      if (typeof this.height === 'number') {
        return { height: `${this.height}px` } // 数値は "px" を付与
      }
      return { height: this.height } // 文字列はそのまま適用
    },

    /**
     * コンポーネントが使用する、処理中であるかどうかのフラグです。
     * - AirRenderlessItemManger の loading も参照します。
     * - 値が更新されると `update:loading` イベントを emit します。
     */
    computedLoading: {
      get() {
        return this.internalLoading || this.managerRef?.loading || false
      },
      set(v) {
        this.internalLoading = v
        this.$emit('update:loading', v)
      },
    },

    /**
     * default スロットで提供するプロパティを返します。
     * NOTE: AirRenderlessItemManager の default スロットプロパティはテンプレートで提供します。
     */
    defaultSlotProps() {
      return {
        color: this.color,
        attrs: {
          color: this.color,
          height: this.height,
          ...this.managerRef?.item,
        },
        on: {
          [this.eventEdit]: () => this.managerRef?.toUpdate(),
          [this.eventDelete]: () => this.managerRef.toDelete(),
        },
      }
    },

    /**
     * dialog スロットで提供するプロパティを返します。
     */
    dialogSlotProps() {
      return {
        attrs: {
          ...this.dialogProps,
          ref: (el) => (this.dialogRef = el),
          scrollable: true,
          value: this.dialog,
        },
        on: {
          input: ($event) => (this.dialog = $event),
        },
        card: this.cardSlotProps,
        inputs: this.inputsSlotProps,
        loading: this.computedLoading,
      }
    },

    /**
     * inputs スロットで提供するプロパティを返します。
     */
    inputsSlotProps() {
      const editItem = this.managerRef?.editItem || {}
      return {
        attrs: {
          ...editItem,
          editMode: this.managerRef?.editMode || undefined,
          isUpdate: this.managerRef?.isUpdate || false,
          isDelete: this.managerRef?.isDelete || false,
          isEditing: this.managerRef?.isEditing || false,
          loading: this.computedLoading,
        },
        on: this.updateEvents,
      }
    },

    /**
     * props.item で与えられたデータ構造をもとに `update:${prop}` イベントを生成して返します。
     * - inputs スロットに配置される子コンポーネントに引き渡されるプロパティです。
     * - 各イベントは AirRenderlessItemManager の updateProperties を実行し、
     *   編集中のアイテムのプロパティを更新します。
     */
    updateEvents() {
      if (!this.managerRef || !this.item) return {}
      const schemaProps = Object.keys(this.item)
      const updates = schemaProps.reduce((result, prop) => {
        // result[`update:${prop}`] = (event) => (this.editItem[prop] = event)
        result[`update:${prop}`] = ($event) => {
          this.managerRef.updateProperties({ [prop]: $event })
        }
        return result
      }, {})
      return updates
    },
  },

  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * data.cardRef を監視します。
     * card スロットに配置されたコンポーネントへの参照を取得したら、
     * コンポーネント内の `.v-card__text` クラスが設定されたエレメントへの参照を
     * data.scrollTargets に保存します。
     */
    cardRef(v) {
      if (!v) return
      this.scrollTargets.splice(0)
      this.scrollTargets = Array.from(v.$el.querySelectorAll('.v-card__text'))
    },

    /**
     * data.dialog を監視します。
     * - ダイアログが終了した際はコンポーネントの状態を初期化します。
     */
    dialog(v) {
      if (v) return
      this.initialize()
    },

    /**
     * props.loading を監視します。
     * - data.internalLoading と同期します。
     */
    loading: {
      handler(v) {
        this.internalLoading = v
      },
      immediate: true,
    },
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * コンポーネントの状態を初期化します。
     * - バリデーションを初期化します。
     * - VDialog が終了した際に、スクロール位置を初期化します。
     * - ステッパーの状態を初期化します。
     */
    initialize() {
      this.resetValidation()
      this.scrollTo()
      this.computedStep = 1
    },

    /**
     * VCard コンポーネントのキャンセルボタンがクリックされた時の処理です。
     * AirRenderlessItemManager の quitEditing を実行します。
     */
    onClickCancel() {
      if (!this.managerRef) return
      this.managerRef.quitEditing()
    },

    /**
     * VCard コンポーネントの確定ボタンがクリックされた時の処理です。
     * submit 関数を実行します。
     */
    onClickSubmit() {
      if (!this.managerRef) return
      this.submit()
    },

    /**
     * VForm の Validation を初期化します。
     */
    resetValidation() {
      if (!this.formRef) return
      if (typeof this.formRef.resetValidation === 'function') {
        this.formRef.resetValidation()
      }
    },

    /**
     * data.scrollTargets に保存されているエレメントを指定された条件でスクロールします。
     * - 対象のエレメントが複数存在する場合があります。
     */
    scrollTo({ top = 0, left = 0, behavior = 'instant' } = {}) {
      this.scrollTargets.forEach((target) => {
        target.scrollTo({ top, left, behavior })
      })
    },

    /**
     * 編集の確定処理です。
     * AirRenderlessItemManager の submit 関数を実行します。
     */
    submit() {
      if (!this.managerRef || !this.validate(this.formRef)) return
      this.managerRef.submit()
    },

    /**
     * 引数で VForm への参照を受け取り、Validation を実行し、結果を Bool 値で返します。
     * @param {Object} formRef - バリデーションを実行する VForm への参照です。
     * @return {boolean} - バリデーションの実行結果です。
     */
    validate(formRef) {
      if (!formRef) return true
      if (!formRef.validate || typeof formRef.validate !== 'function') {
        // eslint-disable-next-line
        console.warn(`VForm does not implement the validate function.`)
        return true
      }
      const result = formRef.validate()
      if (!result) {
        // eslint-disable-next-line no-console
        console.error('There are some fields required value.')
        this.managerRef.setError(`Required fields have not been filled in.`)
      }
      return result
    },

    /*******************************************
     * AirRenderlessItemManager のメソッドを提供
     *******************************************/
    async toRegist() {
      this.initialize()
      await this.managerRef.toRegist()
    },
    async toUpdate() {
      this.initialize()
      await this.managerRef.toUpdate()
    },
    async toDelete() {
      this.initialize()
      await this.managerRef.toDelete()
    },
  },
}
</script>

<template>
  <air-renderless-item-manager
    v-bind="$attrs"
    :ref="(el) => (managerRef = el)"
    :is-editing.sync="dialog"
    :item="item"
    v-on="$listeners"
  >
    <template #default="props">
      <!-- style や class は何故か div に引き渡される。レンダーレスだから？ -->
      <div :style="computedHeight">
        <!-- AirRenderlessItemManager の loading が true の場合に表示するスナックバー -->
        <v-snackbar
          :color="color"
          centered
          :value="computedLoading"
          :timeout="-1"
        >
          <v-progress-circular class="mr-4" indeterminate size="24" />
          処理しています
        </v-snackbar>
        <!--
          item を表示するための UI コンポーネントを配置するためのスロットです。
          AirRenderlessItemManager が提供する他のスロットプロパティがすべて提供されます。
        -->
        <slot name="default" v-bind="{ ...props, ...defaultSlotProps }" />

        <!--
          VDialog のためのスロットです。
        -->
        <slot name="dialog" v-bind="dialogSlotProps">
          <v-dialog v-bind="dialogSlotProps.attrs" v-on="dialogSlotProps.on">
            <!--
              アイテム編集用 VCard のためのスロットです。
              UI コンポーネント群をラップする Card コンポーネントを置換する際に使用します。
            -->
            <slot name="card" v-bind="cardSlotProps">
              <v-card :ref="(el) => (cardRef = el)">
                <v-toolbar
                  class="flex-grow-0"
                  :color="color"
                  :dark="!!color"
                  flat
                >
                  <v-toolbar-title>{{ label }}</v-toolbar-title>
                  <v-spacer />

                  <!-- キャンセルボタン -->
                  <v-btn
                    v-bind="btnCancelProps.attrs"
                    icon
                    v-on="btnCancelProps.on"
                    ><v-icon>{{ btnCancelProps.icon }}</v-icon></v-btn
                  >
                </v-toolbar>
                <v-card-text class="pt-5">
                  <v-form
                    :ref="(el) => (formRef = el)"
                    :disabled="computedLoading"
                    @submit.prevent
                  >
                    <!--
                      UI コンポーネント群のためのスロットです。
                      schema で指定したデータ構造の各プロパティが attrs で props に提供されます。
                      各プロパティ値の更新時に UI コンポーネントから `update:${props}` イベントを
                      emit してください。
                      当該コンポーネントはこのイベントを受けて item のプロパティを更新します。
                    -->
                    <slot name="inputs" v-bind="inputsSlotProps" />

                    <!-- 削除指示の為のチェックボックス -->
                    <v-checkbox
                      v-if="!disableDelete"
                      :input-value="props.editMode"
                      :true-value="props.editModes[1]"
                      :false-value="props.editModes[0]"
                      label="このアイテムを削除する"
                      @change="props.toggleEditMode($event)"
                    />
                  </v-form>
                </v-card-text>
                <v-expand-transition>
                  <v-container v-show="props.hasError" fluid>
                    <v-alert
                      v-for="(error, index) of props.errors"
                      :key="index"
                      class="pb-2"
                      type="error"
                      dense
                    >
                      {{ error }}
                    </v-alert>
                  </v-container>
                </v-expand-transition>
                <v-card-actions>
                  <!-- 確定ボタン -->
                  <v-btn
                    class="ml-auto"
                    v-bind="btnSubmitProps.attrs"
                    :dark="!!color"
                    small
                    v-on="btnSubmitProps.on"
                  >
                    <v-icon left>{{ btnSubmitProps.icon }}</v-icon>
                    {{ btnSubmitProps.label }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </slot>
          </v-dialog>
        </slot>
      </div>
    </template>
  </air-renderless-item-manager>
</template>

<style></style>
