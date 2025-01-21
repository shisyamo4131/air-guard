<script>
/**
 * AirRenderlessArrayManager を拡張した配列管理用コンポーネントです。
 * - テーブルコンポーネントへ容易にプロパティを引き渡すためのプロパティが用意されています。
 * - アイテムを編集するためのダイアログを内包しています。
 * @author shisyamo4131
 * @refact 2025-01-20
 */
import AirRenderlessArrayManager from './AirRenderlessArrayManager.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { AirRenderlessArrayManager },

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
     * アイテムの削除開始トリガーとなるイベントの名前です。
     */
    eventDelete: { type: String, default: 'click:delete', required: false },

    /**
     * アイテムの編集開始トリガーとなるイベントの名前です。
     */
    eventEdit: { type: String, default: 'click:edit', required: false },

    /**
     * eventDelete で指定されたイベントを受け取った時の動作を上書きします。
     * 文字列を指定した場合はその名前でイベントを emit します。
     * 関数を指定した場合はその関数を実行します。
     */
    eventDeleteHandler: {
      type: [String, Function],
      default: undefined,
      required: false,
    },

    /**
     * eventEdit で指定されたイベントを受け取った時の動作を上書きします。
     * 文字列を指定した場合はその名前でイベントを emit します。
     * 関数を指定した場合はその関数を実行します。
     */
    eventEditHandler: {
      type: [String, Function],
      default: undefined,
      required: false,
    },

    /**
     * コンポーネントの高さです。
     */
    height: { type: [String, Number], default: 'auto', required: false },

    /**
     * カードコンポーネントのタイトルとして引き渡されます。
     */
    label: { type: String, default: 'default label', required: false },

    /**
     * コンポーネントが処理中であることを表します。
     * - .sync 修飾子が利用可能です。
     */
    loading: { type: Boolean, default: false, required: false },

    /**
     * テーブルコンポーネントのページ番号です。
     */
    page: { type: Number, default: 1, required: false },

    /**
     * 配列の要素（オブジェクト）のデータ構造を表すスキーマです。
     * オブジェクトやカスタムクラスのインスタンスを受け取ります。
     */
    schema: { type: Object, default: () => ({}), required: false },

    /**
     * 配列の検索文字列です。VDataTable に引き渡されます。
     * - .sync 修飾子で同期することが可能です。
     */
    search: { type: String, default: undefined, required: false },

    /**
     * ステッパーの現在値です。
     * .sync 修飾子が利用可能です。
     */
    step: { type: Number, default: 1, required: false },

    /**
     * ステッパー形式での編集時に使用します。
     * 指定すると、VCardのボタンがステッパー用に切り替わります。
     */
    steps: { type: Array, default: () => [], required: false },

    /**
     * ステッパー利用時に、ステップを進める直前に実行される関数を指定します。
     * editItem は AirRenderlessArrayManager が管理するオブジェクトへの参照です。
     * 直接編集せず、updateProperties を使用します。
     * (editItem, currentStep, updateProperties) => Promise(void)
     */
    stepValidator: { type: Function, default: undefined, required: false },
  },

  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      /**
       * VDialog 制御用の変数です。
       * - 枠外をクリックされたなどして VDialog が終了した場合に、AirRenderlessArrayManagerの
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
       * コンポーネント内部で管理するページ番号です。
       */
      internalPage: 1,

      /**
       * コンポーネント内部で管理する配列の検索文字列です。
       */
      internalSearch: undefined,

      /**
       * コンポーネント内部で管理するステッパーの現在値です。
       */
      internalStep: 1,

      /**
       * AirRenderlessArrayManager への参照です。
       */
      managerRef: null,

      /**
       * テーブルコンポーネントのページ数です。
       */
      pageCount: 0,

      /**
       * card スロットに配置されたコンポーネント内の `.v-card__text` クラスを持つ
       * エレメントの配列です。
       * VDialog の終了時にスクロール位置を初期化するために使用します。
       */
      scrollTargets: [],

      /**
       * ステッパー利用時の form コンポーネントへの参照です。
       * - ステッパーのインデックスをキーとしたオブジェクトで管理します。
       */
      stepperFormRefs: {},
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
     * ステッパー利用時の戻るボタンにバインドするオブジェクトを返します。
     */
    btnStepNextProps() {
      return {
        attrs: {
          color: this.color,
          disabled: this.isLastStep || this.computedLoading,
          loading: this.computedLoading,
        },
        on: {
          click: this.onClickStepNext,
        },
        icon: 'mdi-chevron-right',
        label: '次へ',
      }
    },

    /**
     * ステッパー利用時の戻るボタンにバインドするオブジェクトを返します。
     */
    btnStepPrevProps() {
      return {
        attrs: {
          depressed: true,
          disabled: this.isFirstStep || this.computedLoading,
        },
        on: {
          click: this.onClickStepPrev,
        },
        icon: 'mdi-chevron-left',
        label: '戻る',
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
     * - AirRenderlessArrayManger の loading も参照します。
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
     * コンポーネントが使用するページ番号です。
     * 値が更新されると `update:page` イベントを emit します。
     */
    computedPage: {
      get() {
        return this.internalPage
      },
      set(v) {
        this.internalPage = v
        this.$emit('update:page', v)
      },
    },

    /**
     * コンポーネントが使用する配列の検索文字列です。
     * 値が更新されると `update:search` イベントを emit します。
     */
    computedSearch: {
      get() {
        return this.internalSearch
      },
      set(v) {
        this.internalSearch = v
        this.$emit('update:search', v)
      },
    },

    /**
     * コンポーネントが使用するステッパーの現在値です。
     * 値が更新されると `update:step` イベントを emit します。
     */
    computedStep: {
      get() {
        return this.internalStep
      },
      set(v) {
        this.internalStep = v
        this.$emit('update:step', v)
      },
    },

    /**
     * default スロットで提供するプロパティを返します。
     * NOTE: AirRenderlessArrayManager の default スロットプロパティはテンプレートで提供します。
     */
    defaultSlotProps() {
      return {
        activator: {
          attrs: { color: this.color },
          on: { click: () => this.managerRef?.toRegist() },
        },
        color: this.color,
        height: this.height,
        label: this.label,
        pagination: {
          attrs: {
            color: this.color,
            length: this.pageCount,
            value: this.computedPage,
          },
          on: {
            input: ($event) => (this.computedPage = $event),
          },
        },
        search: {
          attrs: {
            hideDetails: true,
            placeholder: 'SEARCH',
            prependInnerIcon: 'mdi-magnify',
            value: this.computedSearch,
          },
          on: {
            input: ($event) => (this.computedSearch = $event),
          },
        },
        table: {
          attrs: {
            color: this.color,
            items: this.managerRef?.items || [],
            itemKey: this.managerRef?.itemKey || undefined,
            page: this.computedPage,
            search: this.computedSearch,
          },
          on: {
            [this.eventEdit]: ($event) => this._handleToUpdate($event),
            [this.eventDelete]: ($event) => this._handleToDelete($event),
            'page-count': ($event) => (this.pageCount = $event),
            'update:page': ($event) => (this.computedPage = $event),
          },
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
     * ステッパーの現在値が最初のステップであるかどうかを返します。
     * - ステッパー形式での編集でない場合は常に true を返します。
     */
    isFirstStep() {
      if (!this.isStep) return true
      return this.computedStep === 1
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
          isCreate: this.managerRef?.isCreate || false,
          isUpdate: this.managerRef?.isUpdate || false,
          isDelete: this.managerRef?.isDelete || false,
          isEditing: this.managerRef?.isEditing || false,
          loading: this.computedLoading,
        },
        on: this.updateEvents,
      }
    },

    /**
     * ステッパーの現在値が最後のステップであるかどうかを返します。
     * - ステッパー形式での編集でない場合は常に true を返します。
     */
    isLastStep() {
      if (!this.isStep) return true
      return this.computedStep === this.steps.length
    },

    /**
     * ステッパー形式での編集かどうかを返します。
     */
    isStep() {
      return this.steps.length > 0
    },

    /**
     * props.schema で与えられたデータ構造をもとに `update:${prop}` イベントを生成して返します。
     * - inputs スロットに配置される子コンポーネントに引き渡されるプロパティです。
     * - 各イベントは AirRenderlessArrayManager の updateProperties を実行し、
     *   編集中のアイテムのプロパティを更新します。
     */
    updateEvents() {
      if (!this.managerRef || !this.schema) return {}
      const schemaProps = Object.keys(this.schema)
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

    /**
     * props.page を監視します。
     * - data.internalPage と同期します。
     */
    page: {
      handler(v) {
        this.internalPage = v
      },
      immediate: true,
    },

    /**
     * props.search を監視します。
     * - 値を data.internalSearch と同期します。
     */
    search: {
      handler(v) {
        this.internalSearch = v
      },
      immediate: true,
    },

    /**
     * props.step を監視します。
     * - 値を data.internalStep と同期します。
     */
    step: {
      handler(v) {
        this.internalStep = v
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
     * AirRenderlessArrayManager の quitEditing を実行します。
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
     * ステッパー利用時の次へボタンがクリックされた時の処理です。
     * - 現在表示されているステップのバリデーションを実行します。
     * - バリデーションが通った場合のみ、次のステップへ移動します。
     */
    onClickStepNext() {
      if (!this.managerRef) return
      const stepIndex = this.computedStep - 1
      const formRef = this.stepperFormRefs[`step${stepIndex}`]
      if (!this.validate(formRef)) return
      this.stepGoToNext()
    },

    /**
     * ステッパー利用時の戻るボタンがクリックされた時の処理です。
     */
    onClickStepPrev() {
      this.stepGoToPrev()
    },

    /**
     * VForm の Validation を初期化します。
     */
    resetValidation() {
      const targetForms = []
      if (this.formRef) targetForms.push(this.formRef)
      Object.values(this.stepperFormRefs).forEach((ref) => {
        targetForms.push(ref)
      })
      for (const form of targetForms) {
        if (
          form.resetValidation &&
          typeof form.resetValidation === 'function'
        ) {
          form.resetValidation()
        }
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
     * ステップを次に移動させます。
     */
    async stepGoToNext() {
      this.managerRef.clearError()
      this.computedLoading = true
      try {
        if (this.stepValidator) {
          const item = this.managerRef.editItem
          const updateProperties = this.managerRef.updateProperties
          await this.stepValidator(item, this.computedStep, updateProperties)
        }
        this.computedStep += 1
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        this.managerRef.setError(err.message)
      } finally {
        this.computedLoading = false
      }
    },

    /**
     * ステップを前に移動させます。
     */
    stepGoToPrev() {
      if (this.isFirstStep) return
      this.computedStep -= 1
    },

    /**
     * 編集の確定処理です。
     * AirRenderlessArrayManager の submit 関数を実行します。
     */
    submit() {
      // if (!this.managerRef || !this.validate()) return
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

    /**
     * props.editEvent で指定されたイベントを受け取った際の処理です。
     */
    _handleToUpdate(event) {
      // eventEditHandler が指定されていない場合
      if (!this.eventEditHandler) {
        this.managerRef?.toUpdate(event)
        return
      }

      // eventEditHandler が文字列の場合（イベント名として emit）
      if (typeof this.eventEditHandler === 'string') {
        this.$emit(this.eventEditHandler, event)
        return
      }

      // eventEditHandler が関数の場合
      if (typeof this.eventEditHandler === 'function') {
        this.eventEditHandler(event)
      }
    },

    /**
     * props.editDelete で指定されたイベントを受け取った際の処理です。
     */
    _handleToDelete(event) {
      // eventDeleteHandler が指定されていない場合
      if (!this.eventDeleteHandler) {
        this.managerRef?.toDelete(event)
        return
      }

      // eventDeleteHandler が文字列の場合（イベント名として emit）
      if (typeof this.eventDeleteHandler === 'string') {
        this.$emit(this.eventDeleteHandler, event)
        return
      }

      // eventDeleteHandler が関数の場合
      if (typeof this.eventDeleteHandler === 'function') {
        this.eventDeleteHandler(event)
      }
    },
  },
}
</script>

<template>
  <air-renderless-array-manager
    v-bind="$attrs"
    :ref="(el) => (managerRef = el)"
    :is-editing.sync="dialog"
    :schema="schema"
    v-on="$listeners"
  >
    <template #default="props">
      <!-- style や class は何故か div に引き渡される。レンダーレスだから？ -->
      <div :style="computedHeight">
        <!-- AirRenderlessArrayManager の loading が true の場合に表示するスナックバー -->
        <v-snackbar
          :color="color"
          centered
          :value="props.loading"
          :timeout="-1"
        >
          <v-progress-circular class="mr-4" indeterminate size="24" />
          処理しています
        </v-snackbar>
        <!--
          items を表示するための UI コンポーネントを配置するためのスロットです。
          `table` プロパティは VDataTable や VDataIterator 用に用意されています。
          `activator` プロパティは item を登録するためのトリガーとなります。
          AirRenderlessArrayManager が提供する他のスロットプロパティがすべて提供されます。
        -->
        <slot name="default" v-bind="{ ...props, ...defaultSlotProps }">
          <v-data-table
            :headers="[
              ...Object.keys(props.editItem || {}).map((prop) => ({
                text: prop,
                value: prop,
              })),
              { text: 'actions', value: 'actions', align: 'right' },
            ]"
            :items="props.items"
            :item-key="props.itemKey"
            :page="computedPage"
            :search="computedSearch"
            @page-count="pageCount = $event"
            @update:page="computedPage = $event"
          >
            <template #top>
              <v-toolbar flat>
                <v-toolbar-title>{{ label }}</v-toolbar-title>
                <v-divider class="mx-4" inset vertical />
                <v-text-field
                  v-model="computedSearch"
                  clearable
                  dense
                  flat
                  hide-details
                  placeholder="SEARCH"
                  prepend-inner-icon="mdi-magnify"
                />
                <v-spacer />
                <v-btn :color="color" @click="props.toRegist">登録</v-btn>
              </v-toolbar>
            </template>
            <template #[`item.actions`]="{ item }">
              <v-btn :color="color" @click="_handleToUpdate(item)">変更</v-btn>
              <v-btn :color="color" @click="_handleToDelete(item)">削除</v-btn>
            </template>
          </v-data-table>
        </slot>

        <!--
          VDialog のためのスロットです。
        -->
        <slot name="dialog" v-bind="dialogSlotProps">
          <v-dialog v-bind="dialogSlotProps.attrs" v-on="dialogSlotProps.on">
            <!--
              VCard のためのスロットです。
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
                <v-card-text v-if="!isStep" class="pt-5">
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

                    <!-- 削除指示の為のチェックボックス（ステッパー利用時は利用不可） -->
                    <v-checkbox
                      v-if="props.editMode !== props.editModes[0] && !isStep"
                      :input-value="props.editMode"
                      :true-value="props.editModes[2]"
                      :false-value="props.editModes[1]"
                      label="このアイテムを削除する"
                      @change="props.toggleEditMode($event)"
                    />
                  </v-form>
                </v-card-text>
                <v-card-text v-else class="pa-0">
                  <!--
                      ステッパー形式の場合のコンポーネントです。
                      steps で指定した数だけ `step-${index}` という名前でスロットが提供されます。
                      NOTE: インデックスは0から始まります。
                    -->
                  <v-stepper v-if="isStep" v-model="computedStep" flat vertical>
                    <template v-for="(stepIndex, index) of steps">
                      <v-stepper-step
                        :key="`step-${index}`"
                        :complete="computedStep > index + 1"
                        :step="index + 1"
                      >
                        {{ stepIndex }}
                      </v-stepper-step>
                      <v-stepper-content
                        :key="`content-${index}`"
                        :step="index + 1"
                      >
                        <v-form
                          :ref="(el) => (stepperFormRefs[`step${index}`] = el)"
                        >
                          <slot
                            :name="`step-${index}`"
                            v-bind="inputsSlotProps"
                          />
                        </v-form>
                      </v-stepper-content>
                    </template>
                  </v-stepper>
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
                  <!-- 戻るボタン -->
                  <v-btn
                    v-if="isStep"
                    v-bind="btnStepPrevProps.attrs"
                    small
                    v-on="btnStepPrevProps.on"
                  >
                    <v-icon left>{{ btnStepPrevProps.icon }}</v-icon>
                    {{ btnStepPrevProps.label }}
                  </v-btn>

                  <!-- 次へボタン -->
                  <v-btn
                    v-if="isStep && !isLastStep"
                    class="ml-auto"
                    v-bind="btnStepNextProps.attrs"
                    small
                    v-on="btnStepNextProps.on"
                  >
                    {{ btnStepNextProps.label }}
                    <v-icon right>{{ btnStepNextProps.icon }}</v-icon>
                  </v-btn>

                  <!-- 確定ボタン -->
                  <v-btn
                    v-else
                    class="ml-auto"
                    v-bind="btnSubmitProps.attrs"
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
  </air-renderless-array-manager>
</template>

<style></style>
