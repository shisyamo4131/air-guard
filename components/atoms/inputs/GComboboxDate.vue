<script>
/**
 * ### GComboboxDate
 * 日付の選択入力が可能なコンボボックスコンポーネントです。
 * Vuetifyのv-dialogとg-date-picker、g-date-picker-multipleを組み合わせて実装しています。
 *
 * @component
 * @example
 * <GComboboxDate v-model="selectedDate" />
 *
 * @props {Boolean} disabled - コンポーネントの無効化
 * @props {Boolean} multiple - 複数選択の許可
 * @props {Boolean} required - 必須入力設定
 *
 * @version 1.0.0
 * @date 2024-06-21
 * @autor shisyamo4131
 *
 * 概要:
 * GComboboxDateコンポーネントは、カレンダーピッカーを使用して日付を選択するための
 * コンボボックスを提供します。ユーザーは単一または複数の日付を選択できます。
 *
 * 主な機能:
 * - カレンダーピッカーを使用した日付の選択
 * - 単一および複数の日付選択のサポート
 * - 日付選択のダイアログ表示
 * - props.multipleが指定された場合はg-date-picker-multipleコンポーネントによる機能的な日付選択
 *
 * 使用例:
 * <GComboboxDate v-model="selectedDate" :multiple="true" />
 *
 * 更新履歴:
 * 2024-06-21 - 初版作成
 */
import GDatePicker from '../pickers/GDatePicker.vue'
import GDatePickerMultiple from '../pickers/GDatePickerMultiple.vue'
import GCombobox from './GCombobox.vue'
export default {
  /***************************************************************************
   * COMPONENTS
   ***************************************************************************/
  components: { GCombobox, GDatePicker, GDatePickerMultiple },
  /***************************************************************************
   * PROPS
   ***************************************************************************/
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false,
    },
    required: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  /***************************************************************************
   * DATA
   ***************************************************************************/
  data() {
    return {
      dialog: false,
      pickerDate: this.$dayjs().format('YYYY-MM-DD'),
    }
  },
  /***************************************************************************
   * COMPUTED
   ***************************************************************************/
  computed: {
    /**
     * コンポーネントの属性を計算するコンピューテッドプロパティ
     */
    attrs() {
      return {
        disabled: this.disabled,
        multiple: this.multiple,
        readonly: true,
        // dialogが起動するとカーソルが外れることによりvalidatorが動作する。
        // dialogが起動したらrequiredプロパティを強制的にfalseに設定。
        required: this.dialog ? false : this.required,
        ...this.$attrs,
      }
    },
    component() {
      return this.multiple ? 'GDatePickerMultiple' : 'GDatePicker'
    },
    /**
     * v-model用のvalueプロパティのgetterとsetter
     */
    value: {
      get() {
        return this.$attrs.value
      },
      set(v) {
        if (Array.isArray(v)) {
          v.sort((a, b) => (a < b ? -1 : 1))
        }
        this.$emit('input', v)
      },
    },
  },
  /***************************************************************************
   * WATCH
   ***************************************************************************/
  watch: {
    /**
     * ダイアログの開閉を監視し、閉じたときにピッカーの日付をリセット
     */
    dialog(v) {
      if (!v) {
        this.pickerDate = this.$dayjs().format('YYYY-MM-DD')
      }
    },
  },
}
</script>

<template>
  <v-dialog
    ref="dialog"
    v-model="dialog"
    :return-value.sync="value"
    width="290px"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="{
          attrs: { ...attrs, ...props.attrs },
          on: { ...$listeners, ...props.on },
        }"
      >
        <g-combobox
          v-bind="{ ...attrs, ...props.attrs }"
          :dense="!multiple"
          :required="dialog ? false : required"
          append-icon=""
          prepend-inner-icon="mdi-calendar"
          v-on="{ ...$listeners, ...props.on }"
        >
          <template v-if="multiple" #selection="{ item, index }">
            <v-chip v-if="index === 0">
              <span>{{ item }}</span>
            </v-chip>
            <span v-if="index === 1" class="grey--text text-caption">
              (+{{ value.length - 1 }} others)
            </span>
          </template>
        </g-combobox>
      </slot>
    </template>
    <component
      :is="component"
      v-model="value"
      :multiple="multiple"
      no-title
      :picker-date.sync="pickerDate"
    >
      <v-btn text color="primary" @click="dialog = false"> Cancel </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="$refs.dialog.save(value)"> OK </v-btn>
    </component>
  </v-dialog>
</template>

<style scoped>
/* 必要に応じてスタイルを追加 */
</style>
