<script>
/**
 * AirRenderlessArrayManager を拡張した配列管理用コンポーネントです。
 * - テーブルコンポーネントへ容易にプロパティを引き渡すためのプロパティが用意されています。
 * - アイテムを編集するためのダイアログを内包しています。
 * @author shisyamo4131
 * @refact 2025-01-13
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
    color: { type: String, default: undefined, required: false },

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
     * コンポーネントの高さです。
     */
    height: { type: [String, Number], default: undefined, required: false },

    /**
     * カードコンポーネントのタイトルとして引き渡されます。
     */
    label: { type: String, default: 'default label', required: false },

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
       * コンポーネント内部で管理するページ番号です。
       * .sync修飾子を使用可能です。
       */
      internalPage: 1,

      /**
       * コンポーネント内部で管理する配列の検索文字列です。
       * .sync修飾子を使用可能です。
       */
      internalSearch: undefined,

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
    }
  },

  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
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
     * コンポーネントが VForm への参照を保持しているかどうかを返します。
     */
    hasFormRef() {
      const result = !!this.formRef
      if (!result) {
        // eslint-disable-next-line no-console
        console.warn(`Cannot found form component.`)
      }
      return result
    },

    /**
     * props.schema で与えられたデータ構造をもとに `update:${prop}` イベントを生成して返します。
     * - inputs スロットに配置される子コンポーネントに引き渡されるプロパティです。
     * - 各イベントは AirRenderlessArrayManager の updateProperties を実行し、
     *   編集中のアイテムのプロパティを更新します。
     */
    updateEvents() {
      if (!this.schema) return {}
      const schemaProps = Object.keys(this.schema)
      const updates = schemaProps.reduce((result, prop) => {
        // result[`update:${prop}`] = (event) => (this.editItem[prop] = event)
        result[`update:${prop}`] = ($event) => {
          this.$refs.manager.updateProperties({ [prop]: $event })
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
     * - VDialog が終了した際に、スクロール位置を初期化します。
     */
    dialog(v) {
      if (v) return
      this.resetValidation()
      this.scrollTo()
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
  },

  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * VForm の Validation を初期化します。
     */
    resetValidation() {
      if (!this.hasFormRef) return
      const form = this.formRef
      if (!form.resetValidation || typeof form.resetValidation !== 'function') {
        // eslint-disable-next-line
        console.warn(`VForm does not implement the resetValidation function.`)
      }
      form.resetValidation()
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
     * 引数で受け取ったオブジェクトを編集後のアイテムとし、
     * AirRenderlessArrayManager の submit 関数を実行します。
     */
    submit() {
      if (!this.validate()) return
      this.$refs.manager.submit()
    },

    /**
     * VForm コンポーネント内の Validation を実行し、結果を Bool 値で返します。
     * - data.formRef が存在しない場合は警告を出力して true を返します。
     * - data.formRef が validate 関数を実装していない場合は警告を出力して true を返します。
     */
    validate() {
      if (!this.hasFormRef) return true
      const form = this.formRef
      if (!form.validate || typeof form.validate !== 'function') {
        // eslint-disable-next-line
        console.warn(`VForm does not implement the validate function.`)
        return true
      }
      const result = form.validate()
      if (!result) {
        // eslint-disable-next-line no-console
        console.error('There are some fields required value.')
        this.$refs.manager.setError(`Required fields have not been filled in.`)
      }
      return result
    },
  },
}
</script>

<template>
  <air-renderless-array-manager
    v-bind="$attrs"
    ref="manager"
    :is-editing.sync="dialog"
    :schema="schema"
    v-on="$listeners"
  >
    <template #default="props">
      <!-- style や class は何故か v-sheet に引き渡される。レンダーレスだから？ -->
      <v-sheet :height="height">
        <!--
          items を表示するための UI コンポーネントを配置するためのスロットです。
          `table` プロパティは VDataTable や VDataIterator 用に用意されています。
          `activator` プロパティは item を登録するためのトリガーとなります。
          AirRenderlessArrayManager が提供する他のスロットプロパティがすべて提供されます。
        -->
        <slot
          name="default"
          v-bind="{
            ...props,
            color,
            activator: {
              attrs: { color },
              on: { click: props.toRegist },
            },
            height,
            pagination: {
              attrs: {
                length: pageCount,
                value: computedPage,
              },
              on: {
                input: ($event) => (computedPage = $event),
              },
            },
            search: {
              attrs: {
                hideDetails: true,
                placeholder: 'SEARCH',
                prependInnerIcon: 'mdi-magnify',
                value: computedSearch,
              },
              on: {
                input: ($event) => (computedSearch = $event),
              },
            },
            table: {
              attrs: {
                color,
                page: computedPage,
                items: props.items,
                itemKey: props.itemKey,
                search: computedSearch,
              },
              on: {
                [eventEdit]: ($event) => props.toUpdate($event),
                [eventDelete]: ($event) => props.toDelete($event),
                'page-count': ($event) => (pageCount = $event),
                'update:page': ($event) => (computedPage = $event),
              },
            },
          }"
        >
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
              <v-btn :color="color" @click="props.toUpdate(item)">変更</v-btn>
              <v-btn :color="color" @click="props.toDelete(item)">削除</v-btn>
            </template>
          </v-data-table>
        </slot>

        <!--
          VDialog のためのスロットです。
        -->
        <slot
          name="dialog"
          v-bind="{
            attrs: {
              ...dialogProps,
              ref: (el) => (dialogRef = el),
              scrollable: true,
              value: dialog,
            },
            on: {
              input: ($event) => (dialog = $event),
            },
            // dialog スロットの配下にある card スロットのためのプロパティ
            card: {
              attrs: {
                ref: (el) => (cardRef = el),
                item: props.editItem,
                editMode: props.editMode,
                loading: props.submitting,
              },
              on: {
                cancel: props.quitEditing,
                submit,
              },
            },
            // card スロットの配下にある inputs スロットのためのプロパティ
            inputs: {
              attrs: {
                ...props.editItem,
                editMode: props.editMode,
                isCreate: props.isCreate,
                isUpdate: props.isUpdate,
                isDelete: props.isDelete,
                loading: props.submitting,
              },
              on: { ...updateEvents },
            },
            loading: props.submitting,
          }"
        >
          <v-dialog
            :ref="(el) => (dialogRef = el)"
            v-model="dialog"
            v-bind="dialogProps"
            scrollable
          >
            <!--
              VCard のためのスロットです。
              UI コンポーネント群をラップする Card コンポーネントを置換する際に使用します。
            -->
            <slot
              name="card"
              v-bind="{
                attrs: {
                  ref: (el) => (cardRef = el),
                  item: props.editItem,
                  editMode: props.editMode,
                },
                on: {
                  cancel: props.quitEditing,
                  submit,
                },
                color,
                label,
                // card スロットの配下にある inputs スロットのためのプロパティ
                inputs: {
                  attrs: {
                    ...props.editItem,
                    editMode: props.editMode,
                    isCreate: props.isCreate,
                    isUpdate: props.isUpdate,
                    isDelete: props.isDelete,
                    loading: props.submitting,
                  },
                  on: { ...updateEvents },
                },
                loading: props.submitting,
              }"
            >
              <v-card :ref="(el) => (cardRef = el)">
                <v-card-title>{{ label }}</v-card-title>
                <v-card-text class="pt-5">
                  <v-form
                    :ref="(el) => (formRef = el)"
                    :disabled="props.submitting"
                    @submit.prevent
                  >
                    <!--
                      UI コンポーネント群のためのスロットです。
                      schema で指定したデータ構造の各プロパティが attrs で props に提供されます。
                      各プロパティ値の更新時に UI コンポーネントから `update:${props}` イベントを
                      emit してください。
                      当該コンポーネントはこのイベントを受けて item のプロパティを更新します。
                    -->
                    <slot
                      name="inputs"
                      v-bind="{
                        attrs: {
                          ...props.editItem,
                          editMode: props.editMode,
                          isCreate: props.isCreate,
                          isUpdate: props.isUpdate,
                          isDelete: props.isDelete,
                          isEditing: props.isEditing,
                          loading: props.submitting,
                        },
                        on: { ...updateEvents },
                      }"
                    >
                      <!-- PLACE INPUT COMPONENT HERE. -->
                      <v-alert type="warning">
                        これは GArrayManager が inputs スロットで提供する UI
                        コンポーネントの例です。
                      </v-alert>
                      <v-text-field
                        v-for="(prop, index) of Object.keys(props.editItem)"
                        :key="index"
                        :label="prop"
                        :rules="[(v) => !!v || 'This field is required.']"
                        :value="props.editItem[prop]"
                        @input="
                          ($event) => props.updateProperties({ [prop]: $event })
                        "
                      />
                    </slot>
                    <v-checkbox
                      v-if="props.editMode !== props.editModes[0]"
                      :input-value="props.editMode"
                      :true-value="props.editModes[2]"
                      :false-value="props.editModes[1]"
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
                <v-card-actions class="justify-space-between">
                  <v-btn :disabled="props.submitting" @click="props.quitEditing"
                    >CANCEL</v-btn
                  >
                  <v-btn
                    :color="color"
                    :disabled="props.submitting"
                    :loading="props.submitting"
                    @click="submit"
                    >SUBMIT</v-btn
                  >
                </v-card-actions>
              </v-card>
            </slot>
          </v-dialog>
        </slot>
      </v-sheet>
    </template>
  </air-renderless-array-manager>
</template>

<style></style>
