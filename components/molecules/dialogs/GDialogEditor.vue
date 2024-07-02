<script>
/**
 * ### GDialogEditor
 *
 * このコンポーネントは、ダイアログ内でフォームを表示し、データの登録、更新、削除を行います。
 * 内部でGCardSubmitCancelコンポーネントを使用しており、フォームの入力検証とボタン操作を提供します。
 *
 * 機能の詳細：
 * - データを編集するためのInputコンポーネントをdefaultスロットに配置します。
 * - defaultスロットは`attrs`、`on`を提供し、データモデルとのバインディングが容易に設定可能です。
 * - `submit`メソッドでデータの登録、更新、削除を非同期で実行し、完了後にダイアログを閉じます。
 * - フォームの状態やエラーは内部で管理され、ロード中の表示やエラーメッセージの表示も行います。
 * - submit処理に成功すると`submit:complete`イベントをemitします。
 * - submit処理に失敗すると`submit:error`イベントをemitします。
 * - 既定のsubmit処理を変更したい場合は`props.customSubmit`を使用します。
 *
 * 注意事項:
 * - dialogの開閉状態を管理するための変数は内部で保有しており、v-dialogのvalueプロパティは無視されます。
 * - 親コンポーネント側で開閉状態を把握する必要がある場合は`props.isOpen`を.sync修飾子とともに使用します。
 * ‐ dialogを開く際は、このコンポーネントのopen()を使用してください。acitivatorスロットに配置されたコンポーネントの
 *   clickイベントではREGISTモードでdialogが開くようにopen()を呼び出しています。
 * - openメソッドは編集対象データの規定値としてitem、編集モードとしてeditModeを受け付けます。
 * - 編集対象データのプロパティにネストされたオブジェクトを含む場合、Inputコンポーネントがemitするupdateイベントの名前は`-`で区切られている必要があります。
 *
 * @component
 * @example
 * <GDialogEditor ref="some-collection-editor" :model-id="modelId" :label="formLabel">
 *   <template #activator="{ attrs, on }">
 *     <v-btn v-bind="attrs" v-on="on">REGIST</v-btn>
 *   </template>
 *   <template #default="{ attrs, on }">
 *     <g-input-some-collection v-bind="attrs" v-on="on" />
 *   </template>
 * </GDialogEditor>
 *
 * @props
 * @prop {function} customSubmit - 既定のsubmit処理を指定された処理に置き換えます。
 * @prop {object} defaultItem - データモデルを初期化するときの初期値です。サブコレクションを使用する場合などは特に使用します。
 * @prop {boolean} isOpen - dialogの開閉状態です。.sync修飾子と共に使用してください。
 * @prop {string} label - タイトルです。
 * @prop {string} modelId - データモデルのIDです。
 *
 * @version 1.1.0
 * @create 2024-06-24
 * @author shisyamo4131
 *
 * 更新履歴:
 * version 1.1.0 - 2024-07-02
 *  - 継承前提ではなく、`props.modelId`を用意して、プロパティから使用するデータモデルを指定できるように改善。
 *  - `props.customSubmit`を用意し、既定のsubmit処理を置き換えることができるように改善。
 *  - `props.isOpen`を用意し、dialogの開閉状態を親コンポーネント側で把握できるように改善。
 *
 * 2024-06-29 - defaultスロットプロパティ`on`について、モデルが保有するプロパティが
 *              ネストされたオブジェクトであった場合に、最上位以外のプロパティについての
 *              updateイベントを生成できていなかったのを修正。
 */

import GCardSubmitCancel from '../cards/GCardSubmitCancel.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCardSubmitCancel },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    customSubmit: { type: Function, default: undefined, required: false },
    defaultItem: { type: Object, default: () => ({}), required: false },
    isOpen: { type: Boolean, default: false, required: false },
    label: { type: String, default: '', required: false },
    maxWidth: { type: [String, Number], default: 600, required: false },
    modelId: { type: String, required: true },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      editMode: 'REGIST',
      model: null,
      loading: false,
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * defaultスロットのattrsプロパティです。
     * `data.model`の各プロパティの{ key: value }とeditModeをプロパティとした
     * オブジェクトを返します。
     */
    attrs() {
      const props = Object.keys(this.model || {}) // Get all properties of `data.model` as an array.
      return {
        ...props.reduce((acc, i) => {
          acc[i] = this.model[i]
          return acc
        }, {}),
        editMode: this.editMode,
      }
    },
    /**
     * defaultスロットのonプロパティです。
     * `data.model`の各プロパティごとのupdateイベントをkey、値を更新するための関数をvalueとした
     * オブジェクトを返します。
     * ネストされたプロパティの存在をカバーしていますが、updateイベントの名前は`.`ではなく`-`で
     * 結合する必要があります。
     */
    on() {
      /**
       * 引数で受け取ったオブジェクトのプロパティをすべて列挙して配列で返します。
       * ネストされたプロパティに対応するため、再帰的に呼び出されます。
       */
      const getAllProperties = (obj, prefix = '') => {
        let properties = []
        for (const key in obj) {
          if (Object.hasOwn(obj, key)) {
            const propName = prefix ? `${prefix}.${key}` : key
            properties.push(propName)
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              properties = properties.concat(
                getAllProperties(obj[key], propName)
              )
            }
          }
        }
        return properties
      }
      // modelのネストされたものも含めたすべてのプロパティを配列として取得します。
      const props = getAllProperties(this.model)
      return props.reduce((acc, i) => {
        /**
         * すべてのプロパティに対するupdateイベントを生成します。
         * - updateイベントの`:`以降はドットを受け付けないため`-'に置換します。
         */
        acc[`update:${i.replace(/\./g, '-')}`] = ($event) => {
          const keys = i.split('.')
          let current = this.model
          keys.slice(0, -1).forEach((key) => {
            if (!current[key]) current[key] = {}
            current = current[key]
          })
          current[keys[keys.length - 1]] = $event
        }
        return acc
      }, {})
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * `data.dialog`を監視します。
     * 親コンポーネント側でdialogの開閉状態を把握する必要があるケースに対応するため、
     * `data.dialog`が更新された場合にupdate:isOpenイベントをemitします。
     */
    dialog(v) {
      this.$emit('update:isOpen', v)
    },
    /**
     * `props.modelId`を監視します。
     * 指定されたデータモデルを`data.model`にセットし、初期化します。
     */
    modelId: {
      handler(v) {
        this.model = this[`$${v}`]()
        this.model.initialize(this.defaultItem)
      },
      immediate: true,
    },
  },
  /***************************************************************************
   * METHODS
   ***************************************************************************/
  methods: {
    /**
     * dialogを開きます。
     * @param {object} item - `data.model`にセットする初期値
     * @param {string} editMode - 編集モード
     */
    open({ item = {}, editMode = 'REGIST' } = {}) {
      this.editMode = editMode
      if (this.model) this.model.initialize({ ...this.defaultItem, ...item })
      this.dialog = true
    },
    /**
     * submit処理が実行される前の処理です。
     * submit処理に必要な設定が行われているかを検証し、結果を返します。
     * - `data.model`が未設定の場合、コンソールにエラーを出力します。
     * @returns {boolean} 検証の結果を表すブール値
     */
    beforeSubmit() {
      if (!this.model) {
        // eslint-disable-next-line
        console.error('modelが未設定です。')
        return false
      }
      return true
    },
    /**
     * submit処理を行います。
     *
     * @param {string} mode - 編集モードです。次の値を取ります:
     *   - 'REGIST': 新しいドキュメントの作成を行います。
     *   - 'UPDATE': 既存のドキュメントの更新を行います。
     *   - 'DELETE': 既存のドキュメントの削除を行います。
     * @returns {Promise<void>} 非同期操作が完了したときに解決されるPromise
     * @throws {Error} モデル操作に失敗した場合にエラーをスローします。
     */
    async submit(mode) {
      if (!this.beforeSubmit()) return
      this.loading = true
      try {
        if (this.customSubmit) {
          await this.customSubmit(mode, this.model)
        } else {
          await this.defaultSubmit(mode)
        }
        this.afterSubmit(mode)
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        this.$emit('submit:error', err)
      } finally {
        this.loading = false
      }
    },
    /**
     * submit処理が完了した後の処理です。
     * - dialogを終了します。
     * - `submit:complete`イベントをemitします。
     */
    afterSubmit(mode) {
      this.dialog = false
      const item = JSON.parse(JSON.stringify(this.model || {}))
      const editMode = mode
      this.$emit('submit:complete', { item, editMode })
    },
    /**
     * このコンポーネントの既定のsubmit処理です。
     * モードに応じて適切なモデル操作を非同期に実行します。
     *
     * @param {string} mode - 編集モードです。次の値を取ります:
     *   - 'REGIST': 新しいドキュメントの作成を行います。
     *   - 'UPDATE': 既存のドキュメントの更新を行います。
     *   - 'DELETE': 既存のドキュメントの削除を行います。
     * @returns {Promise<void>} 非同期操作が完了したときに解決されるPromise
     * @throws {Error} モデル操作に失敗した場合にエラーをスローします。
     */
    async defaultSubmit(mode) {
      if (mode === 'REGIST') await this.model.create()
      if (mode === 'UPDATE') await this.model.update()
      if (mode === 'DELETE') await this.model.delete()
    },
  },
}
</script>

<template>
  <v-dialog
    v-bind="$attrs"
    v-model="dialog"
    :max-width="maxWidth"
    scrollable
    persistent
    v-on="$listeners"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{ attrs: props.attrs, on: { ...props.on, click: open } }"
      />
    </template>
    <g-card-submit-cancel
      :dialog.sync="dialog"
      :edit-mode="editMode"
      :label="label"
      :loading="loading"
      @click:submit="submit($event)"
    >
      <slot name="default" v-bind="{ attrs, on }" />
    </g-card-submit-cancel>
  </v-dialog>
</template>

<style></style>
